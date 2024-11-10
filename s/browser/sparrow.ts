
import {host} from "./host.js"
import {join} from "./join.js"
import {connect} from "./connect.js"
import {asCableConfig} from "./types.js"
import {invites} from "./utils/invites.js"

import {stdUrl} from "./std/url.js"
import {stdCable} from "./std/cable.js"
import {stdOptions} from "./std/options.js"
import {reportConnectivity} from "./utils/report-connectivity.js"
import {errorLogging, noLogging, stdLogging} from "./std/logging.js"
import {stdRtcConfigurator, turnRtcConfigurator} from "./std/rtc-configurator.js"

export class Sparrow {
	static connect = connect
	static host = host
	static join = join

	static stdCable = stdCable
	static stdOptions = stdOptions
	static stdRtcConfigurator = stdRtcConfigurator
	static turnRtcConfigurator = turnRtcConfigurator
	static stdUrl = stdUrl

	static stdLogging = stdLogging
	static errorLogging = errorLogging
	static noLogging = noLogging

	static invites = invites
	static asCableConfig = asCableConfig
	static reportConnectivity = reportConnectivity
}

