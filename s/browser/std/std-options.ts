
import {stdUrl} from "./std-url.js"
import {ConnectOptions} from "../types.js"
import {stdRtcConfig} from "./std-rtc-config.js"
import {stdDataCable} from "./std-data-cable.js"
import {StdDataCable} from "../../negotiation/types.js"

export function stdOptions(): ConnectOptions<StdDataCable> {
	return {
		url: stdUrl(),
		rtcConfig: stdRtcConfig(),
		cableConfig: stdDataCable(),
		allow: async() => true,
		joined: () => () => {},
		sparrowClosed: () => {},
	}
}

