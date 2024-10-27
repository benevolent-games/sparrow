
import {PartnerApi} from "./partner-api.js"
import {Cable} from "./partnerutils/cable.js"
import {SignalingApi} from "../signaling/api.js"
import {Agent} from "../signaling/agent/agent.js"
import {ConnectionReport} from "./partnerutils/connection-report.js"

export type PartnerOptions<Channels> = {
	signalingApi: SignalingApi
	rtcConfig: RTCConfiguration
	channelsConfig: ChannelsConfig<Channels>
	onCable: (cable: Cable<Channels>) => void
	onReport: (report: ConnectionReport) => void
}

export type ConnectionStatus = "start" | "offer" | "answer" | "accept" | "trickle" | "connected"

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

