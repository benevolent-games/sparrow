
export type AgentInfo = {
	id: string
	reputation: string
}

export type AgentConfidential = {invite: string} & AgentInfo

export type Stats = {
	agents: number
	hourly: StatsHourly
}

export type StatsHourly = {
	connections: number
	failures: number
}

