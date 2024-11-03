
import {repeater, Repeater, Signal} from "@benev/slate"

import {Lobby} from "../types.js"
import {Hosted} from "../../../browser/host.js"
import {Stats} from "../../../signaling/types.js"
import {StdDataCable} from "../../../browser/types.js"
import {Prospect} from "../../../browser/utils/prospect.js"

export class HostingSituation {
	repeater: Repeater
	stopSendingLobby: () => void

	constructor(
			public hosted: Hosted,
			public prospects: Signal<Set<Prospect<StdDataCable>>>,
			public stats: Signal<Stats>,
		) {

		this.repeater = repeater(5_000, async() => await this.#refreshStats())
		this.stopSendingLobby = prospects.on(() => this.#sendLobbyToEverybody())
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
		this.stopSendingLobby()
	}

	kill() {
		for (const prospect of this.prospects.value) {
			const {connection} = prospect
			if (connection) {
				connection.cable.reliable.close()
				connection.cable.unreliable.close()
				prospect.close()
			}
		}
	}

	getConnections() {
		return [...this.prospects.value]
			.map(p => p.connection)
			.filter(c => !!c)
	}

	async #refreshStats() {
		this.stats.value = await this.hosted.getStats()
	}

	async #sendLobbyToEverybody() {
		const lobby = this.getLobby()
		for (const connection of this.getConnections()) {
			connection.cable.reliable.send(JSON.stringify(lobby))
		}
	}
}

