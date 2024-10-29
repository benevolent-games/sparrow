
import {webSocketRemote, endpoint} from "renraku"

import {Sparrow} from "../sparrow.js"
import {version} from "../../version.js"
import {makeBrowserApi} from "../api.js"
import {ConnectOptions} from "../types.js"
import {stdOptions} from "./std-options.js"
import {SignalingApi} from "../../signaling/api.js"
import {CableConfig, StdDataCable} from "../../negotiation/types.js"
import {Connections} from "../../negotiation/partnerutils/connections.js"

export async function connect<Cable = StdDataCable>(
		options_: Partial<ConnectOptions<Cable>>
	) {

	const o = {...stdOptions(), ...options_} as ConnectOptions<Cable>
	const connections = new Connections<Cable>()

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
				cableConfig: o.cableConfig as CableConfig<Cable>,
			},
		})),
	})

	connections.onConnected(connected => {
		connected.onClosed(o.joined(connected))
	})

	const self = await signalingApi.hello(version)
	return new Sparrow<Cable>(socket, signalingApi, self, connections)
}

