
import {Person, PersonInfo} from "./people.js"
import {Pool} from "../../tools/map2.js"
import {hexId} from "../../tools/hex-id.js"
import {DoorPolicyFn} from "../../browser/types.js"

export class Rooms extends Pool<Room> {}

export class Room {
	id = hexId()
	participants = new Set<Person>()

	constructor(
			public host: Person,
			public settings: RoomSettings,
		) {
		this.participants.add(host)
	}

	info(): RoomInfo {
		const {id, settings} = this
		const hostId = this.host.id
		return {
			id,
			hostId,
			label: settings.label,
			discoverable: settings.discoverable,
			participants: [...this.participants].map(p => p.info()),
		}
	}
}

export type RoomListOptions = {
	limit: number
}

export type RoomSettings = {
	label: string
	discoverable: boolean
}

export type HostingOptions = RoomSettings & {
	doorPolicy: DoorPolicyFn
}

export type RoomInfo = {
	id: string
	label: string
	hostId: string
	discoverable: boolean
	participants: PersonInfo[]
}

