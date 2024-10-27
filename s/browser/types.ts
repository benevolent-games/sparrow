
import {AgentInfo} from "../signaling/agent/types.js"
import {ChannelsConfig} from "../negotiation/types.js"
import {Cable} from "../negotiation/partnerutils/cable.js"

export type ConnectOptions<Channels> = {
	url: string
	rtcConfig: RTCConfiguration
	channelsConfig: ChannelsConfig<Channels>
	allow: AllowFn
	joined: JoinedFn<Channels>
	closed: () => void
}

export type AllowFn = (agent: AgentInfo) => Promise<boolean>
export type JoinedFn<Channels> = (cable: Cable<Channels>) => (() => void)

