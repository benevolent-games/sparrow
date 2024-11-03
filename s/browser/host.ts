
import {connect} from "./connect.js"
import {ConnectOptions} from "./types.js"

export type Hosted = Awaited<ReturnType<typeof host>>

export async function host<Cable>(options: ConnectOptions<Cable>) {
	const {self, signaller, close} = await connect(options)
	const invite = await signaller.createInvite()
	return {self, invite, close}
}

