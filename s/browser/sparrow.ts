
import {host} from "./host.js"
import {join} from "./join.js"
import {connect} from "./connect.js"
import {invites} from "./utils/invites.js"
import {mixedId} from "./utils/mixed-id.js"

import {stdDataCable} from "./std/data-cable.js"
import {stdOptions} from "./std/options.js"
import {stdRtcConfig} from "./std/rtc-config.js"
import {stdUrl} from "./std/url.js"

export class Sparrow {
	static connect = connect
	static host = host
	static join = join

	static stdDataCable = stdDataCable
	static stdOptions = stdOptions
	static stdRtcConfig = stdRtcConfig
	static stdUrl = stdUrl

	static invites = invites
	static mixedId = mixedId
}

