
import {PersonInfo} from "../../signaling/parts/people.js"

export class Member {
	constructor(public info: PersonInfo) {}
	get id() { return this.info.id }
	get name() { return this.info.name }
}

