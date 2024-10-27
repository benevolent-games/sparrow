
import {webSocketRemote, endpoint} from "renraku"

import {Sparrow} from "../sparrow.js"
import {version} from "../../version.js"
import {makeBrowserApi} from "../api.js"
import {ConnectOptions} from "../types.js"
import {pubsub} from "../../tools/pubsub.js"
import {stdOptions} from "./connect-options.js"
import {SignalingApi} from "../../signaling/api.js"
import {Cable} from "../../negotiation/partnerutils/cable.js"
import {ChannelsConfig, StdDataChannels} from "../../negotiation/types.js"
import {ConnectionReport} from "../../negotiation/partnerutils/connection-report.js"

export async function connect<Channels = StdDataChannels>(
		options_: Partial<ConnectOptions<Channels>>
	) {

	const o = {...stdOptions(), ...options_} as ConnectOptions<Channels>
	const onCable = pubsub<[Cable<Channels>]>()
	const onReport = pubsub<[ConnectionReport]>()

	const {socket, fns: signalingApi} = await webSocketRemote<SignalingApi>({
		url: o.url,
		getLocalEndpoint: signalingApi => endpoint(makeBrowserApi({
			allow: o.allow,
			partner: {
				signalingApi,
				rtcConfig: o.rtcConfig,
				channelsConfig: o.channelsConfig as ChannelsConfig<Channels>,
				onCable: onCable.publish,
				onReport: onReport.publish,
			},
		})),
	})

	onCable(cable => {
		cable.onClosed(o.joined(cable))
	})

	const self = await signalingApi.hello(version)
	return new Sparrow<Channels>(socket, signalingApi, self, onCable, onReport)
}

