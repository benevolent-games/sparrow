
export type SignallerParams = {
	port: number
	salt: string
	debug: boolean
	turn: {
		allow: Set<string>
		cloudflare?: CloudflareTurnParams
	}
}

export type CloudflareTurnParams = {
	token: {
		id: string
		secret: string
	}
}

export type TurnConfig = {
	urls: string[]
	username: string
	credential: string
}

////////////////////////////////////////////////////////////

export type AgentInfo = {
	id: string
	reputation: string
}

export type Stats = {
	agents: number
	daily: StatsTimeframe
}

export type StatsTimeframe = {
	connections: number
	failures: number
}

