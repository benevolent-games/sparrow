
import {BrowserApiOptions} from "./types.js"
import {AgentInfo} from "../signaling/types.js"
import {deadline} from "renraku"
import {Conduit} from "./utils/conduit.js"

export type BrowserApi = ReturnType<typeof makeBrowserApi>

/**
 * each browser peer exposes these functions to the signalling server.
 * each exposed function is like a lever that the signalling server can pull to remotely control the browser peer.
 * thus, the signalling server is really the one calling the shots and driving the webrtc negotiation.
 * think of the signalling server as a traffic cop (with the whistle) commanding each browser peer throughout the negotation process.
 */
export function makeBrowserApi<Cable>({
		allow,
		signalingApi,
		rtcConfig,
		cableConfig,
		prospects,
	}: BrowserApiOptions<Cable>) {

	const signaller = signalingApi.v1

	const timeout = <R>(
		label: string,
		promise: Promise<R>,
	) => deadline(10_000, label, async() => promise)

	const v1 = {

		/** somebody wants to join a room you are hosting.. will you allow it? */
		async knock(agent: AgentInfo) {
			return await allow(agent)
		},

		async startPeerConnection(agent: AgentInfo) {
			prospects.create({
				agent,
				rtcConfig,
				sendIceCandidate: signaller.sendIceCandidate,
			})
		},

		async produceOffer(agentId: string): Promise<any> {
			return await prospects.attempt(agentId, async prospect => {
				const {peer, cableWait, conduitWait} = prospect
				timeout("offer conduit", Conduit.offering(peer))
					.then(conduitWait.resolve)
					.catch(conduitWait.reject)
				timeout("offer cable", cableConfig.offering(peer))
					.then(cableWait.resolve)
					.catch(cableWait.reject)
				const offer = await peer.createOffer()
				await peer.setLocalDescription(offer)
				return offer
			})
		},

		async produceAnswer(agentId: string, offer: RTCSessionDescription): Promise<any> {
			return await prospects.attempt(agentId, async prospect => {
				const {peer, cableWait, conduitWait} = prospect
				timeout("answer conduit", Conduit.answering(peer))
					.then(conduitWait.resolve)
					.catch(conduitWait.reject)
				timeout("answer cable", cableConfig.answering(peer))
					.then(cableWait.resolve)
					.catch(cableWait.reject)
				await peer.setRemoteDescription(offer)
				const answer = await peer.createAnswer()
				await peer.setLocalDescription(answer)
				return answer
			})
		},

		async acceptAnswer(agentId: string, answer: RTCSessionDescription): Promise<void> {
			return await prospects.attempt(agentId, async prospect => {
				await prospect.peer.setRemoteDescription(answer)
			})
		},

		async acceptIceCandidate(agentId: string, candidate: RTCIceCandidate): Promise<void> {
			return await prospects.attempt(agentId, async prospect => {
				await prospect.acceptIceCandidate(candidate)
			})
		},

		async waitUntilReady(agentId: string): Promise<void> {
			return await prospects.attempt(agentId, async prospect => {
				await prospect.readyPromise
			})
		},

		async completed(agentId: string): Promise<void> {
			return await prospects.attempt(agentId, async prospect => {
				prospect.completedWait.resolve()
			})
		},
	}

	return {v1}
}

