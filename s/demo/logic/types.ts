
import {AgentInfo} from "../../signaling/types.js"

export type Lobby = {
	hostId: string
	people: Person[]
}

export type Person = {
	agent: AgentInfo
	details: UserDetails
	scenario: ConnectingScenario | ConnectedScenario | LocalScenario
}

export type ConnectingScenario = {
	kind: "connecting"
	iceCounts: {
		hostSide: number
		remoteSide: number
	}
}

export type ConnectedScenario = {
	kind: "connected"
	iceCounts: {
		hostSide: number
		remoteSide: number
	}
}

export type LocalScenario = {
	kind: "local"
}

export type UserDetails = {
	name: string
	emoji: string
}

