
import {RandomUserEmojis} from "renraku"
import {Map2, MemeNames, Pubsub, pubsub, repeater, Repeater, signal, Signal, signals} from "@benev/slate"

import {Hosted} from "../../../browser/host.js"
import {Stats} from "../../../signaller/types.js"
import {StdCable} from "../../../browser/types.js"
import {Sparrow} from "../../../browser/sparrow.js"
import {Lobby, Person, UserDetails} from "../types.js"
import {Prospect} from "../../../browser/utils/prospect.js"

export class HostingSituation {
	static async start(url: string, closed: () => void) {
		const memeNames = new MemeNames()
		const randomEmoji = new RandomUserEmojis()

		const prospects = signal(new Set<Prospect<StdCable>>())
		const details = new Map2<string, UserDetails>()
		const onClosed = pubsub()

		const hosted = await Sparrow.host<StdCable>({
			url,
			allow: async() => true,
			closed: () => {
				onClosed.publish()
				closed()
			},

			// new person is attempting to connect
			connecting: prospect => {
				prospects.value.add(prospect)
				prospects.publish()
				prospect.iceReport.onChange(() => prospects.publish())
				const userDetails: UserDetails = {
					name: memeNames.generate(),
					emoji: randomEmoji.pull(),
					stable: true,
				}
				details.set(prospect.id, userDetails)

				// connection is successful
				return connection => {
					prospects.publish()
					connection.onStabilityUpdate(stable => {
						userDetails.stable = stable
						prospects.publish()
					})

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
			stable: true,
		})

		const stats = signal(await hosted.getStats())
		return new this(url, hosted, prospects, stats, details, onClosed)
	}

	repeater: Repeater
	lobby: Signal<Lobby>
	stopUpdates: () => void

	constructor(
			public url: string,
			public hosted: Hosted,
			public prospects: Signal<Set<Prospect<StdCable>>>,
			public stats: Signal<Stats>,
			public details: Map2<string, UserDetails>,
			onClosed: Pubsub,
		) {

		this.lobby = signals.computed(() => this.getLobby())
		this.repeater = repeater(5_000, async() => void await Promise.all([
			this.#refreshStats(),
			this.#broadcastLobby(),
		]))
		this.stopUpdates = this.lobby.on(() => this.#broadcastLobby())
		onClosed(() => this.#closed())
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

	#closed() {
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
		for (const connection of this.getConnections())
			connection.cable.reliable.send(JSON.stringify(lobby))
	}
}

