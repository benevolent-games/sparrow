
import {hash} from "../../tools/hash.js"
import {hexId} from "../../tools/hex-id.js"
import {pubsub} from "../../tools/pubsub.js"
import {BrowserApi} from "../../browser/api.js"
import {AgentConfidential, AgentInfo} from "./types.js"

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

	/** anybody with this key can attempt to join this agent */
	invite = hexId()

	/** pubsub for exchanging ice candidates */
	onIceCandidate = pubsub<[RTCIceCandidate]>()

	constructor(

		/** an id derived from this agent's ip address, useful for banning people */
		public reputation: string,

		public browserApi: BrowserApi,

		/** call this to disconnect this agent from the signaling server */
		public disconnect: () => void,
	) {}

	info(): AgentInfo {
		return {
			id: this.id,
			reputation: this.reputation,
		}
	}

	confidential(): AgentConfidential {
		return {
			...this.info(),
			invite: this.invite,
		}
	}
}

