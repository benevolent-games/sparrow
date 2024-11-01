
import {PartnerApi} from "./partner-api.js"
import {SignalingApi} from "../signaling/api.js"
import {Agent} from "../signaling/agent/agent.js"
import {Connections} from "./utils/connections.js"
import {AgentInfo} from "../signaling/agent/types.js"

export type PartnerOptions<Cable> = {
	signalingApi: SignalingApi
	rtcConfig: RTCConfiguration
	cableConfig: CableConfig<Cable>
	connections: Connections<Cable>
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

export type CableConfig<Cable> = {
	offering: (peer: RTCPeerConnection) => Promise<Cable>
	answering: (peer: RTCPeerConnection) => Promise<Cable>
}

export type StdDataCable = {
	reliable: RTCDataChannel
	unreliable: RTCDataChannel
}

export function asCableConfig<E extends CableConfig<unknown>>(e: E) {
	return e
}

