
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

export type IceServer = {
	urls: string[]
	username?: string
	credential?: string
}

export type TurnYes = {turn: IceServer}
export type TurnNo = {no: string}
export type TurnResult = TurnYes | TurnNo

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

