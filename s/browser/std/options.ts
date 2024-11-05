
import {stdUrl} from "./url.js"
import {stdRtcConfig} from "./rtc-config.js"
import {stdDataCable} from "./data-cable.js"
import {CommonOptions, StdDataCable} from "../types.js"

export function stdOptions(): CommonOptions<StdDataCable> {
	return {
		url: stdUrl(),
		rtcConfig: stdRtcConfig(),
		cableConfig: stdDataCable(),
	}
}

