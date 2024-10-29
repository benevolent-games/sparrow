
import {PartnerApi} from "./partner-api.js"
import {SignalingApi} from "../signaling/api.js"
import {Agent} from "../signaling/agent/agent.js"
import {AgentInfo} from "../signaling/agent/types.js"
import {Connections} from "./partnerutils/connections.js"

export type PartnerOptions<Channels> = {
	signalingApi: SignalingApi
	rtcConfig: RTCConfiguration
	channelsConfig: ChannelsConfig<Channels>
	connections: Connections<Channels>
}

export type Partner = {
	api: PartnerApi
	agent: Agent
}

export type ConnectionOptions = {
	agent: AgentInfo
	rtcConfig: RTCConfiguration
	sendIceCandidate: SendIceCandidateFn
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

