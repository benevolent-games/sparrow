
import {stdUrl} from "./url.js"
import {stdCable} from "./cable.js"
import {stdLogging} from "./logging.js"
import {stdRtcConfig} from "./rtc-config.js"
import {CommonOptions, StdCable} from "../types.js"

export function stdOptions(): CommonOptions<StdCable> {
	return {
		url: stdUrl(),
		rtcConfig: stdRtcConfig(),
		cableConfig: stdCable(),
		logging: stdLogging(),
	}
}

