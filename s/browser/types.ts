
import {AgentInfo} from "../signaling/agent/types.js"
import {ChannelsConfig} from "../negotiation/types.js"
import {Cable} from "../negotiation/partnerutils/cable.js"

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
	hostClosed: (peer: Cable<Channels>) => void
} & BasicOptions<Channels>

export type AllowFn = (agent: AgentInfo) => Promise<boolean>
export type JoinedFn<Channels> = (cable: Cable<Channels>) => (() => void)

