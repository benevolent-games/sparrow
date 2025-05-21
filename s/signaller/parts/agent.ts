
import {sub} from "@e280/stz"
import {Id} from "../../tools/id.js"
import {AgentInfo} from "../types.js"
import {BrowserApi} from "../../browser/api.js"

export class Agent {

	/** id for this specific agent connection to the sparrow server */
	id = Id.random()

	/** all invites issued by this agent */
	invites = new Set<string>()

	/** pubsub for exchanging ice candidates */
	onIceCandidate = sub<[RTCIceCandidate]>()

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

