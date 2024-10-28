
import {PartnerOptions} from "./types.js"
import {AgentInfo} from "../signaling/agent/types.js"
import {Operations} from "./partnerutils/operations.js"

export type PartnerApi = ReturnType<typeof makePartnerApi>

/**
 * each browser peer exposes these functions to the signalling server.
 * each exposed function is like a lever that the signalling server can pull to remotely control the browser peer.
 * thus, the signalling server is really the one calling the shots and driving the webrtc negotiation.
 * think of the signalling server as a traffic cop (with the whistle) commanding each browser peer throughout the negotation process.
 */
export function makePartnerApi<Channels>({
		signalingApi,
		rtcConfig,
		channelsConfig,
		goose,
	}: PartnerOptions<Channels>) {

	const operations = new Operations<Channels>()

	return {
		async startPeerConnection(agent: AgentInfo) {
			const operation = operations.create({
				agent,
				rtcConfig,
				sendIceCandidate: signalingApi.sendIceCandidate,
			})
			goose.addOperation(operation)
			return operation.id
		},

		async produceOffer(opId: number): Promise<any> {
			return await operations.attempt(opId, async operation => {
				const {peer, channelsWaiting} = operation
				channelsConfig.offering(peer).then(channelsWaiting.resolve)
				const offer = await peer.createOffer()
				await peer.setLocalDescription(offer)
				return offer
			})
		},

		async produceAnswer(opId: number, offer: RTCSessionDescription): Promise<any> {
			return await operations.attempt(opId, async operation => {
				const {peer, channelsWaiting} = operation
				channelsConfig.answering(peer).then(channelsWaiting.resolve)
				await peer.setRemoteDescription(offer)
				const answer = await peer.createAnswer()
				await peer.setLocalDescription(answer)
				return answer
			})
		},

		async acceptAnswer(opId: number, answer: RTCSessionDescription): Promise<void> {
			return await operations.attempt(opId, async operation => {
				await operation.peer.setRemoteDescription(answer)
			})
		},

		async acceptIceCandidate(opId: number, candidate: RTCIceCandidate): Promise<void> {
			return await operations.attempt(opId, async operation => {
				await operation.acceptIceCandidate(candidate)
			})
		},

		async waitUntilReady(opId: number): Promise<void> {
			return await operations.attempt(opId, async operation => {
				await operation.cablePromise
			})
		},
	}
}

