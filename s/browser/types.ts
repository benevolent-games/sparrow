
import {AgentInfo} from "../signaling/agent/types.js"
import {CableConfig} from "../negotiation/types.js"
import {Connected} from "../negotiation/partnerutils/connected.js"

export type BasicOptions<Cable> = {
	url: string
	rtcConfig: RTCConfiguration
	cableConfig: CableConfig<Cable>
}

export type ConnectOptions<Cable> = {
	allow: AllowFn
	joined: JoinedFn<Cable>
	sparrowClosed: () => void
} & BasicOptions<Cable>

export type JoinOptions<Cable> = {
	invite: string
	hostClosed: (peer: Connected<Cable>) => void
} & BasicOptions<Cable>

export type AllowFn = (agent: AgentInfo) => Promise<boolean>
export type JoinedFn<Cable> = (connected: Connected<Cable>) => (() => void)
