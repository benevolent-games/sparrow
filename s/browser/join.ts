
import {connect} from "./connect.js"
import {JoinOptions} from "./types.js"

export type Joined = Awaited<ReturnType<typeof join>>

export async function join<Cable>(options: JoinOptions<Cable>) {
	const allow = options.allow ?? (async() => true)

	const {self, signaller, close} = await connect({
		...options,
		allow,
		closed: () => {},
		connecting: prospect => connecting => {
			return () => {}
		},
	})

	const host = await signaller.query(options.invite)

	const weAllowHost = await allow(host)
	if (!weAllowHost)
		throw new Error("we snubbed the host")

	const hostAllowsUs = await signaller.join(options.invite)
	if (!hostAllowsUs)
		throw new Error("the host snubbed us")

	return {self, close}
}

