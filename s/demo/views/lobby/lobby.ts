
import {Sparrow} from "../../../browser/sparrow.js"
import {AgentInfo} from "../../../signaling/types.js"

export type Lobby = {
	hostId: string
	people: {
		connected: boolean
		agent: AgentInfo
		iceCounts: {
			hostSide: number
			remoteSide: number
		}
	}[]
}

export function makeLobby(sparrow: Sparrow<any>): Lobby {
	return {
		hostId: sparrow.id,
		people: sparrow.connections.map(connection => ({
			agent: connection.agent,
			connected: !!connection.connected,
			iceCounts: {
				hostSide: connection.iceReport.locals.length,
				remoteSide: connection.iceReport.remotes.length,
			},
		}))
	}
}

