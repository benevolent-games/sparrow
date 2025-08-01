
import {stdUrl} from "./url.js"
import {stdCable} from "./cable.js"
import {stdRtcConfigurator} from "./rtc-configurator.js"
import {CommonOptions, StdCable} from "../types.js"

export function stdOptions(): CommonOptions<StdCable> {
	return {
		timeout: 30_000,
		url: stdUrl(),
		cableConfig: stdCable(),
		rtcConfigurator: stdRtcConfigurator,
	}
}

