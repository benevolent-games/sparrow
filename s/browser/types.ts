
import {AgentInfo} from "../signaling/types.js"
import {SignalingApi} from "../signaling/api.js"
import {Connections} from "../negotiation/utils/connections.js"

export type BrowserApiOptions<Cable> = {
	allow: AllowFn
	signalingApi: SignalingApi
	rtcConfig: RTCConfiguration
	cableConfig: CableConfig<Cable>
	connections: Connections<Cable>
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

///////////////////////////////////////////

export type BasicOptions<Cable> = {
	url: string
	rtcConfig: RTCConfiguration
	cableConfig: CableConfig<Cable>
}

export type ConnectOptions<Cable> = {
	allow: AllowFn
	connecting: ConnectingFn
	closed: () => void
} & Partial<BasicOptions<Cable>>

export type JoinOptions<Cable> = {
	invite: string
	disconnected: () => void
	allow?: AllowFn
	connecting?: ConnectingFn
} & ConnectOptions<Cable>

export type AllowFn = (agent: AgentInfo) => Promise<boolean>
export type ConnectingFn = (prospect: any) => (connection: any) => () => void

