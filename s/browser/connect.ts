
import {sub, Sub, repeat, nap} from "@e280/stz"
import Renraku from "@e280/renraku"

import {stdOptions} from "./std/options.js"
import {SignallerApi} from "../signaller/api.js"
import {makeBrowserApi} from "../browser/api.js"
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

	let selfId: string | undefined
	const connections = new Set<Connection<Cable>>()

	const socket = new WebSocket(o.url)

	const {remote: signallerApi} = await Renraku.wsConnect<SignallerApi>({
		tap: new Renraku.LoggerTap(),
		socket,
		disconnected: () => {
			if (stopKeepAlive)
				stopKeepAlive()
			o.closed()
		},
		connector: async connection => {
			return {
				fns: makeBrowserApi({
					allow: async agent => !!(
						agent.id !== selfId &&
						await allow(agent)
					),
					signallerApi: connection.remote,
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
				disconnected() {

				},
			}
		},
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
	const stopKeepAlive = repeat(async() => {
		const stats = await signaller.stats()
		connected.stats = stats
		onStats.pub(stats)
		await nap(keepAliveInterval)
	})

	return connected
}

