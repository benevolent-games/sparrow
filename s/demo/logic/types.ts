
import {AgentInfo} from "../../signaling/types.js"

export type Lobby = {
	hostId: string
	people: Person[]
}

export type Person = {
	agent: AgentInfo
	details: UserDetails
	connected: boolean
	iceCounts: {
		hostSide: number
		remoteSide: number
	}
}

export type UserDetails = {
	name: string
}

