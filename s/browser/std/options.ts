
import {stdUrl} from "./url.js"
import {stdCable} from "./cable.js"
import {stdLogging} from "./logging.js"
import {CommonOptions, StdCable} from "../types.js"
import {stdRtcConfigurator} from "./rtc-configurator.js"

export function stdOptions(): CommonOptions<StdCable> {
	return {
		url: stdUrl(),
		logging: stdLogging(),
		cableConfig: stdCable(),
		rtcConfigurator: stdRtcConfigurator,
	}
}

