
import {pubsub} from "../../tools/pubsub.js"
import {ConnectionStatus} from "../types.js"
import {AgentInfo} from "../../signaling/agent/types.js"

export class ConnectionReport {
	#iceCount = 0
	#status: ConnectionStatus = "start"

	onChange = pubsub<[ConnectionReport]>()

	constructor(public operationId: number, public agent: AgentInfo) {}

	get iceCount() { return this.#iceCount }
	set iceCount(x: number) {
		this.#iceCount = x
		this.onChange.publish(this)
	}

	get status() { return this.#status }
	set status(s: ConnectionStatus) {
		this.#status = s
		this.onChange.publish(this)
	}
}

