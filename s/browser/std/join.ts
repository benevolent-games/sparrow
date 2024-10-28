
import {connect} from "./connect.js"
import {JoinOptions} from "../types.js"
import {Cable} from "../../negotiation/partnerutils/cable.js"

export async function join<Channels>(options: JoinOptions<Channels>) {
	let hostPeer: Cable<Channels> | undefined

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

	sparrow.close()
	return hostPeer
}

