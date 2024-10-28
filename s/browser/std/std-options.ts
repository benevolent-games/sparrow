
import {stdUrl} from "./std-url.js"
import {ConnectOptions} from "../types.js"
import {stdRtcConfig} from "./std-rtc-config.js"
import {stdDataChannels} from "./std-data-channels.js"
import {StdDataChannels} from "../../negotiation/types.js"

export function stdOptions(): ConnectOptions<StdDataChannels> {
	return {
		url: stdUrl(),
		rtcConfig: stdRtcConfig(),
		channelsConfig: stdDataChannels(),
		allow: async() => true,
		joined: () => () => {},
		sparrowClosed: () => {},
	}
}

