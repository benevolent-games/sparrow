
import {expose, webSocketRemote} from "renraku"

import {Sparrow} from "../sparrow.js"
import {version} from "../../version.js"
import {makeBrowserApi} from "../api.js"
import {ConnectOptions} from "../types.js"
import {pubsub} from "../../tools/pubsub.js"
import {stdOptions} from "./connect-options.js"
import {SignalingApi} from "../../signaling/api.js"
import {DoorPolicies} from "../parts/door-policies.js"
import {Cable} from "../../negotiation/partnerutils/cable.js"
import {ChannelsConfig, StdDataChannels} from "../../negotiation/types.js"
import {ConnectionReport} from "../../negotiation/partnerutils/connection-report.js"

export async function connect<Channels = StdDataChannels>(
		options: Partial<ConnectOptions<Channels>> = stdOptions() as ConnectOptions<any>
	) {

	const o = {...stdOptions(), ...options}
	const onCable = pubsub<[Cable<Channels>]>()
	const onReport = pubsub<[ConnectionReport]>()
	const doorPolicies = new DoorPolicies()

	const {socket, fns: signalingApi} = await webSocketRemote<SignalingApi>({
		url: o.url,
		getLocalEndpoint: signalingApi => expose(() => makeBrowserApi({
			doorPolicies,
			partner: {
				signalingApi,
				rtcConfig: o.rtcConfig,
				channelsConfig: o.channelsConfig as ChannelsConfig<Channels>,
				onCable: onCable.publish,
				onReport: onReport.publish,
			},
		})),
	})

	const self = await signalingApi.hello(version)

	return new Sparrow<Channels>(socket, signalingApi, self, doorPolicies, onCable, onReport)
}

