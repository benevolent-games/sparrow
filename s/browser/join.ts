
import {connect} from "./connect.js"
import {JoinOptions} from "./types.js"

export async function join<Cable>(options: JoinOptions<Cable>) {
	const {self, signaller, close} = await connect(options)
	const host = await signaller.query(options.invite)

	const isAllowed = await options.allow(host)
	if (!isAllowed)
		throw new Error("we snubbed the host")

	const connection = await signaller.join(options.invite)

	return {self, connection, close}
}

