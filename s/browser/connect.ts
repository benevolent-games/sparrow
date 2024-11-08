
import {ev} from "@benev/slate"
import {endpoint, loggers, webSocketRemote} from "renraku"

import {stdOptions} from "./std/options.js"
import {Prospects} from "./utils/prospects.js"
import {AgentInfo} from "../signaller/types.js"
import {SignallerApi} from "../signaller/api.js"
import {makeBrowserApi} from "../browser/api.js"
import {CableConfig, ConnectOptions} from "./types.js"

export class Connected {
	constructor(
		public self: AgentInfo,
		public signaller: SignallerApi["v1"],
		public close: () => void,
	) {}
}

export async function connect<Cable>(options: ConnectOptions<Cable>) {
	const o = {...stdOptions(), ...options}
	const emoji = "👤"
	const remoteLogging = loggers.label({remote: true, label: `${emoji} ->`, prefix: "server"})
	const localLogging = loggers.label({remote: false, label: `${emoji} <-`, prefix: "client"})

	let selfId: string | undefined

	const prospects = new Prospects(options.connecting)

	// disconnect everybody when the user kills the tab
	ev(window, {beforeunload: () => prospects.disconnectEverybody()})

	const {socket, remote: signallerApi} = await webSocketRemote<SignallerApi>({
		...remoteLogging,
		url: o.url,
		onClose: o.closed,
		getLocalEndpoint: signallerApi => endpoint(
			makeBrowserApi({
				allow: async agent => !!(
					agent.id !== selfId &&
					await o.allow(agent)
				),
				signallerApi,
				rtcConfig: o.rtcConfig,
				cableConfig: o.cableConfig as CableConfig<Cable>,
				onProspect: prospect => {},
				onConnection: connection => {},
			}),
			localLogging,
		),
	})

	const signaller = signallerApi.v1 as SignallerApi["v1"]
	const self = await signaller.hello()
	const close = () => socket.close()
	return new Connected(self, signaller, close)
}

