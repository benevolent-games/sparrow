
import {Sub, defer} from "@e280/stz"

import {connect, Connect} from "./connect.js"
import {SignallerApi} from "../signaller/api.js"
import {AgentInfo, SignallerStats} from "../signaller/types.js"
import {Connection, JoinOptions, Prospect, StdCable} from "./types.js"

export class Join<Cable = StdCable> extends Connect {
	constructor(
			signaller: SignallerApi["v1"],
			self: AgentInfo,
			stats: SignallerStats,
			onStats: Sub<[SignallerStats]>,
			close: () => void,
			public invite: string,
			public host: AgentInfo,
			public prospect: Prospect,
			public connection: Connection<Cable>,
		) {
		super(signaller, self, stats, onStats, close)
	}
}

/** @deprecated renamed to Join */
export class SparrowJoin extends Connect {}

export async function join<Cable = StdCable>(options: JoinOptions<Cable>) {
	const {invite} = options
	const allow = options.allow ?? (async() => true)
	const connecting = options.welcome ?? (() => () => () => {})
	const ready = defer<[Prospect, Connection<Cable>]>()

	const {signaller, self, stats, onStats, close} = await connect({
		...options,
		allow,
		closed: () => {},
		welcome: prospect => {
			const next = connecting(prospect)

			return connection => {
				const disconnected = next(connection)
				ready.resolve([prospect, connection])

				return () => {
					disconnected()
					options.disconnected()
				}
			}
		},
	})

	const host = await signaller.query(options.invite)

	const weAllowHost = await allow(host)
	if (!weAllowHost)
		throw new Error("we snubbed the host")

	const hostAllowsUs = await signaller.join(options.invite)
	if (!hostAllowsUs)
		throw new Error("the host snubbed us")

	const [prospect, connection] = await ready.promise

	// close connection to signaller after we've joined
	close()

	return new Join<Cable>(
		signaller,
		self,
		stats,
		onStats,
		close,
		invite,
		host,
		prospect,
		connection,
	)
}

