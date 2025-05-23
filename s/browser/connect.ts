
import {sub, Sub} from "@e280/stz"
import {repeating} from "@benev/slate"
import {endpoint, webSocketRemote} from "renraku"

import {stdOptions} from "./std/options.js"
import {SignallerApi} from "../signaller/api.js"
import {makeBrowserApi} from "../browser/api.js"
import {clientLogging} from "./utils/client-logging.js"
import {AgentInfo, SignallerStats} from "../signaller/types.js"
import {CableConfig, Connection, ConnectOptions, StdCable} from "./types.js"

export class SparrowConnect {
	constructor(
		public signaller: SignallerApi["v1"],
		public self: AgentInfo,
		public stats: SignallerStats,
		public onStats: Sub<[SignallerStats]>,
		public close: () => void,
	) {}
}

export async function connect<Cable = StdCable>(options: ConnectOptions<Cable>) {
	const o = {...stdOptions(), ...options}
	const allow = o.allow ?? (async() => true)
	const logging = clientLogging("👤")

	let selfId: string | undefined
	const connections = new Set<Connection<Cable>>()

	const {socket, remote: signallerApi} = await webSocketRemote<SignallerApi>({
		...logging.remote,
		url: o.url,
		timeout: o.timeout,
		onClose: () => {
			if (stopKeepAlive)
				stopKeepAlive()
			o.closed()
		},
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

	const onStats = sub<[SignallerStats]>()
	const connected = new SparrowConnect(signaller, self, stats, onStats, close)

	const keepAliveInterval = 0.45 * o.timeout
	const stopKeepAlive = repeating(keepAliveInterval, async() => {
		const stats = await signaller.stats()
		connected.stats = stats
		onStats.pub(stats)
	})

	return connected
}

