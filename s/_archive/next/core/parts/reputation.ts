
import {Connection} from "./connection.js"
import {hex_id} from "../../../toolbox/id.js"
import {ReputationClaim} from "../../types.js"

export class Reputation {
	readonly id = hex_id()
	readonly secret = hex_id()

	lastContact = Date.now()
	connection: Connection | null = null

	readonly claim: ReputationClaim = {
		id: this.id,
		secret: this.secret,
	}

	touch() {
		this.lastContact = Date.now()
	}
}
