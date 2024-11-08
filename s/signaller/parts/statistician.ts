
import {Agent} from "./agent.js"
import {Stats, StatsTimeframe} from "../types.js"

type StatName = "connection" | "failure"
type StatEvent = [number, StatName]

export class Statistician {
	#events: StatEvent[] = []
	#daily: StatsTimeframe = {
		failures: 0,
		connections: 0,
	}

	constructor(private agents: Set<Agent>) {}

	#recompute() {
		const hour = 1000 * 60 * 60
		const dayAgo = Date.now() - (24 * hour)

		const daily: StatsTimeframe = {
			failures: 0,
			connections: 0,
		}

		this.#events = this.#events.filter(([timestamp, stat]) => {
			if (stat === "connection")
				daily.connections++
			if (stat === "failure")
				daily.failures++
			return timestamp >= dayAgo
		})
		this.#daily = daily
	}

	stats(): Stats {
		return {
			daily: this.#daily,
			agents: this.agents.size,
		}
	}

	recordConnection() {
		this.#events.push([Date.now(), "connection"])
		this.#recompute()
	}

	recordFailure() {
		this.#events.push([Date.now(), "failure"])
		this.#recompute()
	}
}

