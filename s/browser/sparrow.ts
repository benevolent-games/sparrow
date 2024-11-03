
import {connect} from "./connect.js"
import {host} from "./host.js"
import {join} from "./join.js"

import {stdDataCable} from "./std/data-cable.js"
import {stdOptions} from "./std/options.js"
import {stdRtcConfig} from "./std/rtc-config.js"
import {stdUrl} from "./std/url.js"

export class Sparrow {
	connect = connect
	host = host
	join = join

	stdDataCable = stdDataCable
	stdOptions = stdOptions
	stdRtcConfig = stdRtcConfig
	stdUrl = stdUrl
}

