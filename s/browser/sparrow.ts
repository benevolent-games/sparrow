
import {host} from "./host.js"
import {join} from "./join.js"
import {connect} from "./connect.js"
import {asCableConfig} from "./types.js"
import {invites} from "./utils/invites.js"
import {mixedId} from "./utils/mixed-id.js"

import {stdCable} from "./std/cable.js"
import {stdOptions} from "./std/options.js"
import {rtcConfig, stdRtcConfig} from "./std/rtc-config.js"
import {stdUrl} from "./std/url.js"
import {errorLogging, noLogging, stdLogging} from "./std/logging.js"

export class Sparrow {
	static connect = connect
	static host = host
	static join = join

	static stdCable = stdCable
	static stdOptions = stdOptions
	static stdRtcConfig = stdRtcConfig
	static stdUrl = stdUrl

	static stdLogging = stdLogging
	static errorLogging = errorLogging
	static noLogging = noLogging

	static rtcConfig = rtcConfig
	static invites = invites
	static mixedId = mixedId
	static asCableConfig = asCableConfig
}

