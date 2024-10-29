

import {Member} from "./member.js"
import {Contact} from "./contact.js"
import {Sparrow} from "../sparrow.js"
import {RoomInfo} from "../../signaling/parts/rooms.js"

/** room from the host's perspective */
export class HostRoom<Channels> {
	host: Member
	members = new Set<Member | Contact<Channels>>()

	constructor(
			public sparrow: Sparrow<Channels>,
			public room: RoomInfo,
		) {

		this.host = new Member(sparrow.self)
		this.members.add(this.host)
	}

	terminate() {}
}

