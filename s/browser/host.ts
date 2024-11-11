
import {Pubsub} from "@benev/slate"

import {ConnectOptions} from "./types.js"
import {SignallerApi} from "../signaller/api.js"
import {connect, SparrowConnect} from "./connect.js"
import {AgentInfo, SignallerStats} from "../signaller/types.js"

export class SparrowHost extends SparrowConnect {
	constructor(
			signaller: SignallerApi["v1"],
			self: AgentInfo,
			stats: SignallerStats,
			onStats: Pubsub<[SignallerStats]>,
			close: () => void,
			public invite: string,
		) {
		super(signaller, self, stats, onStats, close)
	}
}

export async function host<Cable>(options: ConnectOptions<Cable>) {
	const {signaller, self, stats, onStats, close} = await connect(options)
	const invite = await signaller.createInvite()
	return new SparrowHost(signaller, self, stats, onStats, close, invite)
}

