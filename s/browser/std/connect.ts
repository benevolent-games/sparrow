
import {webSocketRemote, endpoint} from "renraku"

import {Sparrow} from "../sparrow.js"
import {Goose} from "../parts/goose.js"
import {version} from "../../version.js"
import {makeBrowserApi} from "../api.js"
import {ConnectOptions} from "../types.js"
import {stdOptions} from "./std-options.js"
import {SignalingApi} from "../../signaling/api.js"
import {ChannelsConfig, StdDataChannels} from "../../negotiation/types.js"

export async function connect<Channels = StdDataChannels>(
		options_: Partial<ConnectOptions<Channels>>
	) {

	const o = {...stdOptions(), ...options_} as ConnectOptions<Channels>
	const goose = new Goose<Channels>()

	const {socket, fns: signalingApi} = await webSocketRemote<SignalingApi>({
		url: o.url,
		getLocalEndpoint: signalingApi => endpoint(makeBrowserApi({
			allow: async agent => !!(
				!goose.operations.has(agent.id) &&
				await o.allow(agent)
			),
			partner: {
				signalingApi,
				rtcConfig: o.rtcConfig,
				channelsConfig: o.channelsConfig as ChannelsConfig<Channels>,
				goose,
			},
		})),
	})

	goose.onCable(cable => {
		cable.onClosed(o.joined(cable))
	})

	const self = await signalingApi.hello(version)
	return new Sparrow<Channels>(socket, signalingApi, self, goose)
}

