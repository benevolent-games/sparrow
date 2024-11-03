
import {Agents} from "./agents.js"
import {Stats, StatsHourly} from "../types.js"

type StatName = "connection" | "failure"
type StatEvent = [number, StatName]

export class Statistician {
	#events: StatEvent[] = []
	#hourly: StatsHourly = {
		failures: 0,
		connections: 0,
	}

	constructor(private agents: Agents) {}

	#recompute() {
		const hourAgo = Date.now() - (1000 * 60 * 60)
		const hourly: StatsHourly = {
			failures: 0,
			connections: 0,
		}
		this.#events = this.#events.filter(([timestamp, stat]) => {
			if (stat === "connection")
				hourly.connections++
			if (stat === "failure")
				hourly.failures++
			return timestamp >= hourAgo
		})
		this.#hourly = hourly
	}

	stats(): Stats {
		return {
			hourly: this.#hourly,
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

