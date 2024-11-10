
import {ev} from "@benev/slate"
import {endpoint, webSocketRemote} from "renraku"

import {stdOptions} from "./std/options.js"
import {AgentInfo} from "../signaller/types.js"
import {SignallerApi} from "../signaller/api.js"
import {makeBrowserApi} from "../browser/api.js"
import {clientLogging} from "./utils/client-logging.js"
import {CableConfig, Connection, ConnectOptions, generalTimeout} from "./types.js"

export class Connected {
	constructor(
		public self: AgentInfo,
		public signaller: SignallerApi["v1"],
		public close: () => void,
	) {}
}

export async function connect<Cable>(options: ConnectOptions<Cable>) {
	const o = {...stdOptions(), ...options}
	const logging = clientLogging("👤")

	let selfId: string | undefined
	const connections = new Set<Connection<Cable>>()

	// disconnect everybody when the user kills the tab
	ev(window, {beforeunload: () => {
		for (const connection of connections)
			connection.disconnect()
	}})

	const {socket, remote: signallerApi} = await webSocketRemote<SignallerApi>({
		...logging.remote,
		url: o.url,
		onClose: o.closed,
		timeout: generalTimeout,
		getLocalEndpoint: signallerApi => endpoint(
			makeBrowserApi({
				allow: async agent => !!(
					agent.id !== selfId &&
					await o.allow(agent)
				),
				signallerApi,
				rtcConfigurator: o.rtcConfigurator,
				cableConfig: o.cableConfig as CableConfig<Cable>,
				welcome: prospect => {
					const connected = o.welcome(prospect)
					return connection => {
						connections.add(connection)
						const disconnected = connected(connection)
						return () => {
							connections.delete(connection)
							disconnected()
						}
					}
				}
			}),
			logging.local,
		),
	})

	const signaller = signallerApi.v1 as SignallerApi["v1"]
	const self = await signaller.hello()
	const close = () => socket.close()
	return new Connected(self, signaller, close)
}

