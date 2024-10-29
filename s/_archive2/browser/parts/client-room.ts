
import {Member} from "./member.js"
import {Contact} from "./contact.js"
import {Sparrow} from "../sparrow.js"
import {RoomInfo} from "../../signaling/parts/rooms.js"
import {PersonInfo} from "../../signaling/parts/people.js"

/** room from the client's perspective */
export class ClientRoom<Channels> {
	host: Contact<Channels>
	members = new Set<Member | Contact<Channels>>()

	constructor(
			public sparrow: Sparrow<Channels>,
			public room: RoomInfo,
			public hostInfo: PersonInfo,
		) {

		const cable = sparrow.cables.require(hostInfo.id)
		this.host = new Contact(hostInfo, cable)

		for (const person of room.participants) {
			this.members.add(
				(person.id === this.host.id)
					? this.host
					: new Member(person)
			)
		}
	}
}

