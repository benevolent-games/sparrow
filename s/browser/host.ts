
import {connect} from "./connect.js"
import {ConnectOptions} from "./types.js"
import {AgentInfo, Stats} from "../signaling/types.js"

export class Hosted {
	constructor(
		public self: AgentInfo,
		public invite: string,
		public getStats: () => Promise<Stats>,
		public close: () => void,
	) {}
}

export async function host<Cable>(options: ConnectOptions<Cable>) {
	const {self, signaller, close} = await connect(options)
	const invite = await signaller.createInvite()
	const getStats = async() => await signaller.stats()
	return new Hosted(self, invite, getStats, close)
}

