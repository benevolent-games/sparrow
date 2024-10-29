
import {webSocketRemote, endpoint} from "renraku"

import {Sparrow} from "../sparrow.js"
import {version} from "../../version.js"
import {makeBrowserApi} from "../api.js"
import {ConnectOptions} from "../types.js"
import {stdOptions} from "./std-options.js"
import {SignalingApi} from "../../signaling/api.js"
import {Connections} from "../../negotiation/partnerutils/connections.js"
import {ChannelsConfig, StdDataChannels} from "../../negotiation/types.js"

export async function connect<Channels = StdDataChannels>(
		options_: Partial<ConnectOptions<Channels>>
	) {

	const o = {...stdOptions(), ...options_} as ConnectOptions<Channels>
	const connections = new Connections<Channels>()

	const {socket, fns: signalingApi} = await webSocketRemote<SignalingApi>({
		url: o.url,
		getLocalEndpoint: signalingApi => endpoint(makeBrowserApi({
			allow: async agent => !!(
				!connections.has(agent.id) &&
				await o.allow(agent)
			),
			partner: {
				connections,
				signalingApi,
				rtcConfig: o.rtcConfig,
				channelsConfig: o.channelsConfig as ChannelsConfig<Channels>,
			},
		})),
	})

	connections.onConnected(connected => {
		connected.onClosed(o.joined(connected))
	})

	const self = await signalingApi.hello(version)
	return new Sparrow<Channels>(socket, signalingApi, self, connections)
}

