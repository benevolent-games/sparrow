
import {stdUrl} from "./url.js"
import {stdCable} from "./cable.js"
import {stdLogging} from "./logging.js"
import {stdRtcConfigurator} from "./rtc-configurator.js"
import {CommonOptions, StdCable} from "../types.js"

export function stdOptions(): CommonOptions<StdCable> {
	return {
		url: stdUrl(),
		rtcConfigurator: stdRtcConfigurator,
		cableConfig: stdCable(),
		logging: stdLogging(),
	}
}

