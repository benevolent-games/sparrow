
import {Map2, MemeNames, repeater, Repeater, signal, Signal, signals} from "@benev/slate"
import {Lobby, Person, UserDetails} from "../types.js"
import {Hosted} from "../../../browser/host.js"
import {Stats} from "../../../signaling/types.js"
import {Sparrow} from "../../../browser/sparrow.js"
import {StdDataCable} from "../../../browser/types.js"
import {Prospect} from "../../../browser/utils/prospect.js"
import {RandomUserEmojis} from "renraku"

export class HostingSituation {
	static async start(url: string, closed: () => void) {
		const memeNames = new MemeNames()
		const randomEmoji = new RandomUserEmojis()

		const prospects = signal(new Set<Prospect<StdDataCable>>())
		const details = new Map2<string, UserDetails>()

		const hosted = await Sparrow.host<StdDataCable>({
			url,
			allow: async() => true,
			closed: () => {
				hosting.closed()
				closed()
			},

			// new person is attempting to connect
			connecting: prospect => {
				prospects.value.add(prospect)
				prospects.publish()
				prospect.iceReport.onChange(() => prospects.publish())
				details.set(prospect.id, {
					name: memeNames.generate(),
					emoji: randomEmoji.pull(),
				})

				// connection is successful
				return () => {
					prospects.publish()

					// person has disconnected
					return () => {
						prospects.value.delete(prospect)
						prospects.publish()
						details.delete(prospect.id)
					}
				}
			},
		})

		details.set(hosted.self.id, {
			name: memeNames.generate(),
			emoji: randomEmoji.pull(),
		})

		const stats = signal(await hosted.getStats())
		const hosting = new this(url, hosted, prospects, stats, details)
		return hosting
	}

	repeater: Repeater
	lobby: Signal<Lobby> = signal(this.getLobby())
	stopUpdates: () => void

	constructor(
			public url: string,
			public hosted: Hosted,
			public prospects: Signal<Set<Prospect<StdDataCable>>>,
			public stats: Signal<Stats>,
			public details: Map2<string, UserDetails>,
		) {

		this.repeater = repeater(5_000, async() => void await Promise.all([
			this.#refreshStats(),
			this.#broadcastLobby(),
		]))
		this.lobby = signals.computed(() => this.getLobby())
		this.stopUpdates = this.lobby.on(() => this.#broadcastLobby())
	}

	getLobby(): Lobby {
		const selfPerson: Person = {
			agent: this.hosted.self,
			details: this.details.require(this.hosted.self.id),
			scenario: {kind: "local"}
		}

		const remotePeople = [...this.prospects.value].map((prospect): Person => ({
			agent: prospect.agent,
			details: this.details.require(prospect.agent.id),
			scenario: (!!prospect.connection
				? {
					kind: "connected",
					iceCounts: {
						hostSide: prospect.iceReport.locals.length,
						remoteSide: prospect.iceReport.remotes.length,
					},
				}
				: {
					kind: "connecting",
					iceCounts: {
						hostSide: prospect.iceReport.locals.length,
						remoteSide: prospect.iceReport.remotes.length,
					},
				}
			),
		}))

		return {
			hostId: this.hosted.self.id,
			people: [selfPerson, ...remotePeople],
		}
	}

	closed() {
		this.repeater.stop()
		this.stopUpdates()
	}

	findProspect(id: string) {
		return [...this.prospects.value].find(p => p.id === id)
	}

	killProspect(id: string) {
		const prospect = this.findProspect(id)
		if (prospect) {
			const {connection} = prospect
			if (connection) {
				connection.cable.reliable.close()
				connection.cable.unreliable.close()
				connection.disconnect()
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

	async #broadcastLobby() {
		const lobby = this.getLobby()
		for (const connection of this.getConnections()) {
			connection.cable.reliable.send(JSON.stringify(lobby))
		}
	}
}

