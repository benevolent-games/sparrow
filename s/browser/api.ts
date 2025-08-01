
import {MapG, sub, ev} from "@e280/stz"

import {Conduit} from "./utils/conduit.js"
import {AgentInfo} from "../signaller/types.js"
import {gather_ice} from "./utils/gather-ice.js"
import {wait_for_connection} from "./utils/wait-for-connection.js"
import {BrowserApiOptions, Connection, Prospect} from "./types.js"

export type BrowserApi = ReturnType<typeof makeBrowserApi>

/**
 * each browser peer exposes these functions to the signalling server.
 * each exposed function is like a lever that the signalling server can pull to remotely control the browser peer.
 * thus, the signalling server is really the one calling the shots and driving the webrtc negotiation.
 * think of the signalling server as a traffic cop (with the whistle) commanding each browser peer throughout the negotation process.
 */
export function makeBrowserApi<Cable>({
		rtcConfigurator,
		cableConfig,
		signallerApi,
		allow,
		welcome,
	}: BrowserApiOptions<Cable>) {

	const signaller = signallerApi.v1

	type Attempt = {
		prospect: Prospect
		icePromise: Promise<void>
		cablePromise?: Promise<Cable>
		conduitPromise?: Promise<RTCDataChannel>
		connectionPromise: Promise<RTCPeerConnection>
		connected: (connection: Connection<Cable>) => () => void
	}

	const attempts = new MapG<string, Attempt>()

	function destroy(attemptId: string) {
		const attempt = attempts.get(attemptId)
		if (!attempt) return
		attempts.delete(attemptId)
		attempt.prospect.peer.close()
		attempt.prospect.onFailed.pub()
	}

	function catcher(attemptId: string) {
		return (error: any) => {
			console.error(error)
			destroy(attemptId)
			throw error
		}
	}

	async function requireAttempt<R>(attemptId: string, fn: (attempt: Attempt) => Promise<R>) {
		try {
			const attempt = attempts.require(attemptId)
			return await fn(attempt)
		}
		catch (error) {
			destroy(attemptId)
			throw error
		}
	}

	async function maybeAttempt<R>(attemptId: string, fn: (attempt: Attempt) => Promise<R>) {
		try {
			const attempt = attempts.get(attemptId)
			return (attempt)
				? await fn(attempt)
				: undefined
		}
		catch (error) {
			destroy(attemptId)
			throw error
		}
	}

	const v1 = {

		/** somebody wants to join a room you are hosting.. will you allow it? */
		async knock(buddy: AgentInfo) {
			return allow(buddy)
		},

		async startPeerConnection(attemptId: string, buddy: AgentInfo) {
			const attempt = attempts.get(attemptId)
			if (attempt) destroy(attemptId)

			const rtcConfig = await rtcConfigurator({signaller})
			const peer = new RTCPeerConnection(rtcConfig)
			const onFailed = sub()
			const prospect: Prospect = {...buddy, peer, onFailed}
			const icePromise = gather_ice(peer, signaller.sendIceCandidate)
				.catch(catcher(attemptId))

			const connected = welcome(prospect)

			attempts.set(attemptId, {
				prospect,
				icePromise,
				cablePromise: undefined,
				conduitPromise: undefined,
				connectionPromise: wait_for_connection(peer),
				connected,
			})
		},

		async produceOffer(attemptId: string): Promise<any> {
			return requireAttempt(attemptId, async attempt => {
				const {prospect: {peer}} = attempt
				attempt.cablePromise = cableConfig.offering(peer)
					.catch(catcher(attemptId))
				attempt.conduitPromise = Conduit.offering(peer)
					.catch(catcher(attemptId))
				const offer = await peer.createOffer()
				await peer.setLocalDescription(offer)
				return offer
			})
		},

		async produceAnswer(attemptId: string, offer: RTCSessionDescription): Promise<any> {
			return requireAttempt(attemptId, async attempt => {
				const {prospect: {peer}} = attempt
				attempt.cablePromise = cableConfig.answering(peer)
					.catch(catcher(attemptId))
				attempt.conduitPromise = Conduit.answering(peer)
					.catch(catcher(attemptId))
				await peer.setRemoteDescription(offer)
				const answer = await peer.createAnswer()
				await peer.setLocalDescription(answer)
				return answer
			})
		},

		async acceptAnswer(attemptId: string, answer: RTCSessionDescription): Promise<void> {
			return requireAttempt(attemptId, async attempt => {
				await attempt.prospect.peer.setRemoteDescription(answer)
			})
		},

		async acceptIceCandidate(attemptId: string, candidate: RTCIceCandidate): Promise<void> {
			return maybeAttempt(attemptId, async attempt => {
				await attempt.prospect.peer.addIceCandidate(candidate)
			})
		},

		async waitUntilReady(attemptId: string): Promise<void> {
			return requireAttempt(attemptId, async attempt => {
				if (!attempt.cablePromise) throw new Error("required cablePromise missing")
				if (!attempt.conduitPromise) throw new Error("required cablePromise missing")
				await Promise.all([
					attempt.icePromise,
					attempt.cablePromise,
					attempt.conduitPromise,
					attempt.connectionPromise,
				])
			})
		},

		async completed(attemptId: string): Promise<void> {
			return requireAttempt(attemptId, async attempt => {
				const {peer, id, reputation} = attempt.prospect
				const [cable, conduit] = await Promise.all([
					attempt.cablePromise,
					attempt.conduitPromise,
				])

				if (!cable) throw new Error("missing cable")
				if (!conduit) throw new Error("missing conduit")

				const connection: Connection<Cable> = {
					id,
					reputation,
					peer,
					cable,
					disconnect: () => {
						conduit.send("bye")
						died()
					},
				}

				const disconnected = attempt.connected(connection)

				function died() {
					destroy(attemptId)
					disconnected()
				}

				ev(peer, {connectionstatechange: () => {
					if (peer.connectionState === "closed" || peer.connectionState === "failed")
						died()
				}})

				conduit.onmessage = event => {
					if (event.data === "bye")
						died()
				}

				attempts.delete(attemptId)
			})
		},

		async cancel(attemptId: string) {
			destroy(attemptId)
		}
	}

	return {v1}
}

