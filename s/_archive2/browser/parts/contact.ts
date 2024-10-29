
import {Member} from "./member.js"
import {Cable} from "../../negotiation/types.js"
import {PersonInfo} from "../../signaling/parts/people.js"

export class Contact<Channels> extends Member {
	constructor(info: PersonInfo, public cable: Cable<Channels>) {
		super(info)
	}

	get channels() {
		return this.cable.channels
	}

	get peer() {
		return this.cable.peer
	}

	get report() {
		return this.cable.report
	}
}

