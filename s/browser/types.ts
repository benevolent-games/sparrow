
import {Pubsub} from "@benev/slate"
import {Logging} from "./std/logging.js"
import {AgentInfo} from "../signaller/types.js"
import {SignallerApi} from "../signaller/api.js"

export const generalTimeout = 30_000

export type Prospect = {
	id: string
	reputation: string
	peer: RTCPeerConnection
	onFailed: Pubsub
}

export type Connection<Cable> = {
	id: string
	reputation: string
	peer: RTCPeerConnection
	cable: Cable
	disconnect: () => void
}

export type BrowserApiOptions<Cable> = {
	rtcConfig: RTCConfiguration
	cableConfig: CableConfig<Cable>
	signallerApi: SignallerApi
	allow: AllowFn
	welcome: WelcomeFn<Cable>
}

export type SendIceCandidateFn = (candidate: RTCIceCandidate) => Promise<void>

export type CableConfig<Cable> = {
	offering: (peer: RTCPeerConnection) => Promise<Cable>
	answering: (peer: RTCPeerConnection) => Promise<Cable>
}

export type StdCable = {
	reliable: RTCDataChannel
	unreliable: RTCDataChannel
}

export function asCableConfig<Cable>(config: CableConfig<Cable>) {
	return config
}

///////////////////////////////////////////

export type CommonOptions<Cable> = {
	url: string
	rtcConfig: RTCConfiguration
	cableConfig: CableConfig<Cable>
	logging: Logging
}

export type ConnectOptions<Cable> = {
	allow: AllowFn
	welcome: WelcomeFn<Cable>
	closed: () => void
} & Partial<CommonOptions<Cable>>

export type JoinOptions<Cable> = {
	invite: string
	disconnected: () => void
	allow?: AllowFn
	welcome?: WelcomeFn<Cable>
} & Partial<CommonOptions<Cable>>

export type AllowFn = (agent: AgentInfo) => Promise<boolean>
export type WelcomeFn<Cable> = (prospect: Prospect) => (connection: Connection<Cable>) => () => void

