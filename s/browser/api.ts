
import {ev, Map2, nap, pubsub} from "@benev/slate"
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
		rtcConfig,
		cableConfig,
		signallerApi,
		allow,
		welcome,
	}: BrowserApiOptions<Cable>) {

	const signaller = signallerApi.v1

	type Lane = {
		prospect: Prospect
		icePromise: Promise<void>
		cablePromise?: Promise<Cable>
		conduitPromise?: Promise<RTCDataChannel>
		connected: (connection: Connection<Cable>) => () => void
	}

	const lanes = new Map2<string, Lane>()

	function kill(buddyId: string) {
		const lane = lanes.get(buddyId)
		if (!lane) return
		lanes.delete(buddyId)
		lane.prospect.peer.close()
		lane.prospect.onFailed.publish()
	}

	function catcher(buddyId: string) {
		return (error: any) => {
			console.error(error)
			kill(buddyId)
			throw error
		}
	}

	async function attempt<R>(buddyId: string, fn: (lane: Lane) => Promise<R>) {
		try {
			const lane = lanes.require(buddyId)
			return await fn(lane)
		}
		catch (error) {
			kill(buddyId)
			throw error
		}
	}

	const v1 = {

		/** somebody wants to join a room you are hosting.. will you allow it? */
		async knock(buddy: AgentInfo) {
			return allow(buddy)
		},

		async startPeerConnection(buddy: AgentInfo) {
			const lane = lanes.get(buddy.id)
			if (lane) kill(buddy.id)

			const peer = new RTCPeerConnection(rtcConfig)
			const onFailed = pubsub()
			const prospect: Prospect = {...buddy, peer, onFailed}
			const icePromise = gather_ice(peer, signaller.sendIceCandidate)
				.catch(catcher(buddy.id))

			const connected = welcome(prospect)

			lanes.set(buddy.id, {
				prospect,
				icePromise,
				cablePromise: undefined,
				conduitPromise: undefined,
				connected,
			})
		},

		async produceOffer(buddyId: string): Promise<any> {
			return attempt(buddyId, async lane => {
				const {prospect: {peer}} = lane
				lane.cablePromise = cableConfig.offering(peer)
					.catch(catcher(buddyId))
				lane.conduitPromise = Conduit.offering(peer)
					.catch(catcher(buddyId))
				const offer = await peer.createOffer()
				await peer.setLocalDescription(offer)
				return offer
			})
		},

		async produceAnswer(buddyId: string, offer: RTCSessionDescription): Promise<any> {
			return attempt(buddyId, async lane => {
				const {prospect: {peer}} = lane
				lane.cablePromise = cableConfig.answering(peer)
					.catch(catcher(buddyId))
				lane.conduitPromise = Conduit.answering(peer)
					.catch(catcher(buddyId))
				await peer.setRemoteDescription(offer)
				const answer = await peer.createAnswer()
				await peer.setLocalDescription(answer)
				return answer
			})
		},

		async acceptAnswer(buddyId: string, answer: RTCSessionDescription): Promise<void> {
			return attempt(buddyId, async lane => {
				await lane.prospect.peer.setRemoteDescription(answer)
			})
		},

		async acceptIceCandidate(buddyId: string, candidate: RTCIceCandidate): Promise<void> {
			return attempt(buddyId, async lane => {
				await lane.prospect.peer.addIceCandidate(candidate)
			})
		},

		async waitUntilReady(buddyId: string): Promise<void> {
			return attempt(buddyId, async lane => {
				await Promise.all([
					lane.icePromise,
					lane.cablePromise,
					lane.conduitPromise,
					wait_for_connection(lane.prospect.peer),
				])
			})
		},

		async completed(buddyId: string): Promise<void> {
			return attempt(buddyId, async lane => {
				const {peer, id, reputation} = lane.prospect
				const [cable, conduit] = await Promise.all([lane.cablePromise, lane.conduitPromise])
				if (!cable) throw new Error("missing cable")
				if (!conduit) throw new Error("missing conduit")

				conduit.onmessage = event => {
					if (event.data === "bye")
						lane.prospect.peer.close()
				}

				const onDisconnected = pubsub()

				const connection: Connection<Cable> = {
					id,
					reputation,
					peer,
					cable,
					disconnect: () => {
						conduit.send("bye")
						kill(buddyId)
						onDisconnected.publish()
					},
				}

				const disconnected = lane.connected(connection)
				onDisconnected(disconnected)

				ev(peer, {connectionstatechange: () => {
					if (peer.connectionState === "closed" || peer.connectionState === "failed") {
						kill(buddyId)
						onDisconnected.publish()
					}
				}})

				lanes.delete(buddyId)
			})
		},

		async cancel(buddyId: string) {
			kill(buddyId)
		}
	}

	return {v1}
}

