
import {AgentInfo} from "../../signaling/types.js"

export type Lobby = {
	hostId: string
	people: Person[]
}

export type Person = {
	connected: boolean
	agent: AgentInfo
	iceCounts: {
		hostSide: number
		remoteSide: number
	}
}

