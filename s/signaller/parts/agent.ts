
import {hash, hexId, pubsub} from "@benev/slate"
import {AgentInfo} from "../types.js"
import {BrowserApi} from "../../browser/api.js"

export class Agent {
	static make = async(
			ip: string,
			browserApi: BrowserApi,
			disconnect: () => void,
			salt: string,
		) => {
		const reputation = await hash(ip + salt)
		return new this(reputation, browserApi, disconnect)
	}

	/** id for this specific agent connection to the sparrow server */
	id = hexId()

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

