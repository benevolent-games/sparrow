
import {AgentInfo} from "../types.js"
import {BrowserApi} from "../../browser/api.js"
import {Base58, hash, Hex, pubsub} from "@benev/slate"

export class Agent {
	static make = async(
			ip: string,
			browserApi: BrowserApi,
			disconnect: () => void,
			salt: string,
		) => {
		const hex = await hash(ip + salt)
		const bytes = Hex.bytes(hex).slice(0, 8)
		const reputation = Base58.string(bytes)
		return new this(reputation, browserApi, disconnect)
	}

	/** id for this specific agent connection to the sparrow server */
	id = Base58.random(8)

	/** all invites issued by this agent */
	invites = new Set<string>()

	/** pubsub for exchanging ice candidates */
	onIceCandidate = pubsub<[RTCIceCandidate]>()

	constructor(

		/** an id derived from this agent's ip address, useful for banning people */
		public reputation: string,

		/** browser api remote functionality */
		public browserApi: BrowserApi,

		/** call this to disconnect this agent from the signaller server */
		public disconnect: () => void,
	) {}

	info(): AgentInfo {
		return {
			id: this.id,
			reputation: this.reputation,
		}
	}
}

