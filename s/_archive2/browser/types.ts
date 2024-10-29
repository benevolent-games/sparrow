
import {ChannelsConfig} from "../negotiation/types.js"
import {PersonInfo} from "../signaling/parts/people.js"

export type ConnectOptions<Channels> = {
	url: string
	rtcConfig: RTCConfiguration
	channelsConfig: ChannelsConfig<Channels>
}

export type DoorPolicyFn = (personInfo: PersonInfo) => Promise<boolean>

