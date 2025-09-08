
import {Sub} from "@e280/stz"

import {SignallerApi} from "../signaller/api.js"
import {ConnectOptions, StdCable} from "./types.js"
import {connect, Connect} from "./connect.js"
import {AgentInfo, SignallerStats} from "../signaller/types.js"

export class Host extends Connect {
	constructor(
			signaller: SignallerApi["v1"],
			self: AgentInfo,
			stats: SignallerStats,
			onStats: Sub<[SignallerStats]>,
			close: () => void,
			public invite: string,
		) {
		super(signaller, self, stats, onStats, close)
	}
}

/** @deprecated renamed to Host */
export class SparrowHost extends Connect {}

export async function host<Cable = StdCable>(options: ConnectOptions<Cable>) {
	const {signaller, self, stats, onStats, close} = await connect(options)
	const invite = await signaller.createInvite()
	return new Host(signaller, self, stats, onStats, close, invite)
}

