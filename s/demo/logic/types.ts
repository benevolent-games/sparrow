
import {AgentInfo} from "../../signaller/types.js"

export type Lobby = {
	hostId: string
	people: Person[]
}

export type Person = {
	agent: AgentInfo
	details: UserDetails
	scenario: ConnectingScenario | ConnectedScenario | LocalScenario
}

export type IceCounts = {
	hostSide: number
	joinSide: number
}

export type ConnectingScenario = {
	kind: "connecting"
}

export type ConnectedScenario = {
	kind: "connected"
}

export type LocalScenario = {
	kind: "local"
}

export type UserDetails = {
	name: string
	emoji: string
	stable: boolean
}

