
import {webSocketRemote, endpoint, loggers} from "renraku"

import {Sparrow} from "../sparrow.js"
import {version} from "../../version.js"
import {makeBrowserApi} from "../api.js"
import {ConnectOptions} from "../types.js"
import {stdOptions} from "./std-options.js"
import {SignalingApi} from "../../signaling/api.js"
import {Connections} from "../../negotiation/utils/connections.js"
import {CableConfig, StdDataCable} from "../../negotiation/types.js"

export async function connect<Cable = StdDataCable>(
		options_: Partial<ConnectOptions<Cable>>
	) {

	const o = {...stdOptions(), ...options_} as ConnectOptions<Cable>
	const connections = new Connections<Cable>()
	let selfId: string | undefined

	const emoji = "👤"
	const remoteLogging = loggers.label({remote: true, label: `${emoji} ->`, prefix: "server"})
	const localLogging = loggers.label({remote: false, label: `${emoji} <-`, prefix: "client"})

	const {socket, fns: signalingApi} = await webSocketRemote<SignalingApi>({
		...remoteLogging,
		url: o.url,
		onClose: o.sparrowClosed,
		getLocalEndpoint: signalingApi => endpoint(
			makeBrowserApi({
				allow: async agent => !!(
					agent.id !== selfId &&
					!connections.has(agent.id) &&
					await o.allow(agent)
				),
				partner: {
					connections,
					signalingApi,
					rtcConfig: o.rtcConfig,
					cableConfig: o.cableConfig as CableConfig<Cable>,
				},
			}),
			localLogging,
		),
	})

	connections.onConnected(connected => {
		connected.onClosed(o.joined(connected))
	})

	const self = await signalingApi.hello(version)
	selfId = self.id

	return new Sparrow<Cable>(socket, signalingApi, self, connections)
}

