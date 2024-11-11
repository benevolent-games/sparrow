
import {Pubsub} from "@benev/slate"

import {ConnectOptions} from "./types.js"
import {connect, Connected} from "./connect.js"
import {SignallerApi} from "../signaller/api.js"
import {AgentInfo, Stats} from "../signaller/types.js"

export class Hosted extends Connected {
	constructor(
			signaller: SignallerApi["v1"],
			self: AgentInfo,
			stats: Stats,
			onStats: Pubsub<[Stats]>,
			close: () => void,
			public invite: string,
		) {
		super(signaller, self, stats, onStats, close)
	}
}

export async function host<Cable>(options: ConnectOptions<Cable>) {
	const {signaller, self, stats, onStats, close} = await connect(options)
	const invite = await signaller.createInvite()
	return new Hosted(signaller, self, stats, onStats, close, invite)
}

