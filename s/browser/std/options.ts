
import {stdUrl} from "./url.js"
import {stdRtcConfig} from "./rtc-config.js"
import {stdDataCable} from "./data-cable.js"
import {BasicOptions, StdDataCable} from "../types.js"

export function stdOptions(): BasicOptions<StdDataCable> {
	return {
		url: stdUrl(),
		rtcConfig: stdRtcConfig(),
		cableConfig: stdDataCable(),
	}
}

