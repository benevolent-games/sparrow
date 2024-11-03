
import {repeater, Repeater, signal, Signal, signals, Trashbin} from "@benev/slate"

import {Lobby} from "../types.js"
import {Hosted} from "../../../browser/host.js"
import {Stats} from "../../../signaling/types.js"
import {StdDataCable} from "../../../browser/types.js"
import {Prospect} from "../../../browser/utils/prospect.js"

export class HostingSituation {
	repeater: Repeater
	lobby: Signal<Lobby> = signal(this.getLobby())
	stopUpdates: () => void

	constructor(
			public url: string,
			public hosted: Hosted,
			public prospects: Signal<Set<Prospect<StdDataCable>>>,
			public stats: Signal<Stats>,
		) {

		this.repeater = repeater(5_000, async() => await this.#refreshStats())
		this.lobby = signals.computed(() => this.getLobby())
		this.stopUpdates = this.lobby.on(lobby => this.#sendToEverybody(lobby))
	}

	getLobby(): Lobby {
		return {
			hostId: this.hosted.self.id,
			people: [...this.prospects.value].map(({agent, iceReport, connection}) => ({
				agent,
				connected: !!connection,
				iceCounts: {
					hostSide: iceReport.locals.length,
					remoteSide: iceReport.remotes.length,
				},
			})),
		}
	}

	closed() {
		this.repeater.stop()
		this.stopUpdates()
	}

	kill() {
		this.closed()
		for (const prospect of this.prospects.value) {
			const {connection} = prospect
			if (connection) {
				connection.cable.reliable.close()
				connection.cable.unreliable.close()
				prospect.close()
			}
		}
		this.hosted.close()
	}

	getConnections() {
		return [...this.prospects.value]
			.map(p => p.connection)
			.filter(c => !!c)
	}

	async #refreshStats() {
		this.stats.value = await this.hosted.getStats()
	}

	async #sendToEverybody(lobby: Lobby) {
		for (const connection of this.getConnections()) {
			connection.cable.reliable.send(JSON.stringify(lobby))
		}
	}
}

