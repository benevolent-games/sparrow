
import {stdUrl} from "./url.js"
import {ConnectOptions} from "../types.js"
import {stdRtcConfig} from "./rtc-config.js"
import {stdDataChannels} from "./data-channels.js"
import {StdDataChannels} from "../../negotiation/types.js"

export function stdOptions(): ConnectOptions<StdDataChannels> {
	return {
		url: stdUrl(),
		rtcConfig: stdRtcConfig(),
		channelsConfig: stdDataChannels(),
		allow: async() => true,
		joined: () => () => {},
		closed: () => {},
	}
}

