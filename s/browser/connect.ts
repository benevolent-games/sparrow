
import {endpoint, webSocketRemote} from "renraku"
import {ev, Pubsub, pubsub, repeat} from "@benev/slate"

import {stdOptions} from "./std/options.js"
import {SignallerApi} from "../signaller/api.js"
import {makeBrowserApi} from "../browser/api.js"
import {AgentInfo, Stats} from "../signaller/types.js"
import {clientLogging} from "./utils/client-logging.js"
import {CableConfig, Connection, ConnectOptions, generalTimeout} from "./types.js"

export class Connected {
	constructor(
		public signaller: SignallerApi["v1"],
		public self: AgentInfo,
		public stats: Stats,
		public onStats: Pubsub<[Stats]>,
		public close: () => void,
	) {}
}

export async function connect<Cable>(options: ConnectOptions<Cable>) {
	const o = {...stdOptions(), ...options}
	const allow = o.allow ?? (async() => true)
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
		onClose: () => {
			if (stopKeepAlive)
				stopKeepAlive()
			o.closed()
		},
		timeout: generalTimeout,
		getLocalEndpoint: signallerApi => endpoint(
			makeBrowserApi({
				allow: async agent => !!(
					agent.id !== selfId &&
					await allow(agent)
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

	const [self, stats] = await Promise.all([
		signaller.hello(),
		signaller.stats(),
	])

	const close = () => {
		socket.close()
		stopKeepAlive()
	}

	const onStats = pubsub<[Stats]>()
	const connected = new Connected(signaller, self, stats, onStats, close)

	const keepAliveInterval = 0.45 * generalTimeout
	const stopKeepAlive = repeat(keepAliveInterval, async() => {
		const stats = await signaller.stats()
		connected.stats = stats
		onStats.publish(stats)
	})

	return connected
}

