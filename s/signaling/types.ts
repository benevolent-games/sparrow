
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

