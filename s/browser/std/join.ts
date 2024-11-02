
import {connect} from "./connect.js"
import {JoinOptions} from "../types.js"
import {Connected} from "../../negotiation/utils/connected.js"

export async function join<Cable>(options: JoinOptions<Cable>) {
	let hostPeer: Connected<Cable> | undefined

	const sparrow = await connect({
		...options,
		allow: async() => false,
		joined: peer => {
			hostPeer = peer
			return () => options.hostClosed(peer)
		},
	})

	const host = await sparrow.join(options.invite)

	if (!host)
		throw new Error("snubbed by the host")

	if (!hostPeer)
		throw new Error("failed to obtain host peer")

	if (hostPeer.agent.id !== host.id)
		throw new Error("host peer id mismatch")

	return hostPeer
}

