
import {deferPromise} from "@benev/slate"

import {connect} from "./connect.js"
import {JoinOptions} from "./types.js"
import {Connection} from "./utils/connection.js"

export type Joined = Awaited<ReturnType<typeof join>>

export async function join<Cable>(options: JoinOptions<Cable>) {
	const allow = options.allow ?? (async() => true)
	const connecting = options.connecting ?? (() => () => () => {})
	const ready = deferPromise<Connection<Cable>>()

	const {self, signaller, close} = await connect({
		...options,
		allow,
		closed: () => {},
		connecting: prospect => {
			const next = connecting(prospect)

			return connection => {
				const disconnected = next(connection)
				ready.resolve(connection)

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

	const connection = await ready.promise

	return {self, connection, close}
}

