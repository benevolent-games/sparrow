
import {Sub} from "@e280/stz"

import {SignallerApi} from "../signaller/api.js"
import {ConnectOptions, StdCable} from "./types.js"
import {connect, SparrowConnect} from "./connect.js"
import {AgentInfo, SignallerStats} from "../signaller/types.js"

export class SparrowHost extends SparrowConnect {
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

export async function host<Cable = StdCable>(options: ConnectOptions<Cable>) {
	const {signaller, self, stats, onStats, close} = await connect(options)
	const invite = await signaller.createInvite()
	return new SparrowHost(signaller, self, stats, onStats, close, invite)
}

