
import {deferPromise} from "@benev/slate"

import {connect} from "./connect.js"
import {AgentInfo} from "../signaller/types.js"
import {Connection, JoinOptions, Prospect, StdCable} from "./types.js"

export class Joined<Cable = StdCable> {
	constructor(
		public invite: string,
		public self: AgentInfo,
		public host: AgentInfo,
		public prospect: Prospect,
		public connection: Connection<Cable>,
	) {}
}

export async function join<Cable>(options: JoinOptions<Cable>) {
	const {invite} = options
	const allow = options.allow ?? (async() => true)
	const connecting = options.welcome ?? (() => () => () => {})
	const ready = deferPromise<[Prospect, Connection<Cable>]>()

	const {self, signaller, close} = await connect({
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

	close()

	return new Joined<Cable>(invite, self, host, prospect, connection)
}

