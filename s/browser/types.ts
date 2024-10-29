
import {AgentInfo} from "../signaling/agent/types.js"
import {ChannelsConfig} from "../negotiation/types.js"
import {Connected} from "../negotiation/partnerutils/connected.js"

export type BasicOptions<Channels> = {
	url: string
	rtcConfig: RTCConfiguration
	channelsConfig: ChannelsConfig<Channels>
}

export type ConnectOptions<Channels> = {
	allow: AllowFn
	joined: JoinedFn<Channels>
	sparrowClosed: () => void
} & BasicOptions<Channels>

export type JoinOptions<Channels> = {
	invite: string
	hostClosed: (peer: Connected<Channels>) => void
} & BasicOptions<Channels>

export type AllowFn = (agent: AgentInfo) => Promise<boolean>
export type JoinedFn<Channels> = (connected: Connected<Channels>) => (() => void)

