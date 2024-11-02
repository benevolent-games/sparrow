
import {stdUrl} from "./url.js"
import {BasicOptions} from "../types.js"
import {stdRtcConfig} from "./rtc-config.js"
import {stdDataCable} from "./data-cable.js"
import {StdDataCable} from "../../negotiation/types.js"

export function stdOptions(): BasicOptions<StdDataCable> {
	return {
		url: stdUrl(),
		rtcConfig: stdRtcConfig(),
		cableConfig: stdDataCable(),
	}
}

