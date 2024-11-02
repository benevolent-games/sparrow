
import {AgentInfo} from "../signaling/types.js"

export async function connect(options: {}) {
	const {socket, fns: {v0: signaller}} = {} as any
	const self = await signaller.hello()
	const close = () => socket.close()
	return {self, signaller, close}
}

export async function host(options: {
		allow: (agent: AgentInfo) => Promise<any>
		connecting: (prospect: any) => (connection: any) => () => void
		closed: () => void
	}) {
	const {self, signaller, close} = await connect(options)
	const invite = await signaller.createInvite()
	return {self, invite, close}
}

export async function join(options: {
		invite: string
		allow: (agent: AgentInfo) => Promise<any>
		disconnected: any
	}) {

	const {self, signaller, close} = await connect(options)
	const host = await signaller.knock(options.invite)

	if (!host)
		throw new Error("the host snubbed us")

	const isAllowed = await options.allow(host)

	if (!isAllowed)
		throw new Error("we snubbed the host")

	const connection = await signaller.join(options.invite)

	return {self, connection, close}
}

