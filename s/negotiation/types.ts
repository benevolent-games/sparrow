
import {PartnerApi} from "./partner-api.js"
import {SignalingApi} from "../signaling/api.js"
import {Agent} from "../signaling/agent/agent.js"
import {Operations} from "./partnerutils/operations.js"

export type PartnerOptions<Channels> = {
	signalingApi: SignalingApi
	rtcConfig: RTCConfiguration
	channelsConfig: ChannelsConfig<Channels>
	operations: Operations<Channels>
}

export type Partner = {
	api: PartnerApi
	agent: Agent
}

export type SendIceCandidateFn = (candidate: RTCIceCandidate) => Promise<void>

export type ChannelsConfig<Channels> = {
	offering: (peer: RTCPeerConnection) => Promise<Channels>
	answering: (peer: RTCPeerConnection) => Promise<Channels>
}

export type StdDataChannels = {
	reliable: RTCDataChannel
	unreliable: RTCDataChannel
}

export function asChannelsConfig<E extends ChannelsConfig<unknown>>(e: E) {
	return e
}

