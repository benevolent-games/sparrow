
import {sub, Sub} from "@e280/stz"
import {RandomUserEmojis} from "@e280/renraku"
import {ev, repeating, signal, Signal, signals} from "@benev/slate"

import {Id} from "../../../tools/id.js"
import {Sparrow} from "../../../browser/sparrow.js"
import {SparrowHost} from "../../../browser/host.js"
import {Lobby, Person, UserDetails} from "../types.js"
import {SignallerStats} from "../../../signaller/types.js"
import {Connection, StdCable} from "../../../browser/types.js"
import {ConnectivityReport, reportConnectivity} from "../../../browser/utils/report-connectivity.js"

type User = {
	id: string
	reputation: string
	details: UserDetails
	connection: Connection<StdCable> | null
	report: ConnectivityReport | null
}

export class HostingSituation {
	stopRtcStats: () => void
	stopSignallerStats: () => void

	lobby: Signal<Lobby>
	stopUpdates: () => void

	constructor(
			public url: string,
			public hosted: SparrowHost,
			public users: Signal<Set<User>>,
			public stats: Signal<SignallerStats>,
			onClosed: Sub,
		) {
		this.lobby = signals.computed(() => this.getLobby())
		this.stopSignallerStats = hosted.onStats(value => { stats.value = value })
		this.stopRtcStats = repeating(
			5_000,
			async() => {
				await this.#refreshRtcStats(),
				await this.#broadcastLobby()
			},
		)
		this.stopUpdates = this.lobby.on(() => this.#broadcastLobby())
		onClosed(() => this.#closed())
	}

	static async start(url: string, closed: () => void) {
		const randomEmoji = new RandomUserEmojis()
		const users = signal(new Set<User>)
		const onClosed = sub()

		const hosted = await Sparrow.host<StdCable>({
			url,
			rtcConfigurator: Sparrow.turnRtcConfigurator,
			allow: async() => true,
			closed: () => {
				onClosed.pub()
				closed()
			},

			// new person is attempting to connect
			welcome: prospect => {
				const {id, reputation} = prospect
				const user: User = {
					id,
					reputation,
					connection: null,
					report: null,
					details: {
						name: Id.toDisplayName(id, reputation),
						emoji: randomEmoji.pull(),
						stable: true,
					},
				}

				users.value.add(user)
				users.publish()

				const perished = () => {
					users.value.delete(user)
					users.publish()
				}

				prospect.onFailed(perished)

				// connection is successful
				return connection => {
					user.connection = connection
					users.publish()

					ev(connection.peer, {connectionstatechange: () => {
						user.details.stable = (connection.peer.connectionState !== "disconnected")
					}})

					// person has disconnected
					return perished
				}
			},
		})

		// adding self
		users.value.add({
			id: hosted.self.id,
			reputation: hosted.self.reputation,
			connection: null,
			report: null,
			details: {
				name: Id.toDisplayName(hosted.self.id, hosted.self.reputation),
				emoji: randomEmoji.pull(),
				stable: true,
			},
		})

		return new this(url, hosted, users, signal(hosted.stats), onClosed)
	}

	getLobby(): Lobby {
		return {
			hostId: this.hosted.self.id,
			people: [...this.users.value].map((user): Person => ({
				agent: {id: user.id, reputation: user.reputation},
				details: user.details,
				report: user.report,
				scenario: (
					user.id === this.hosted.self.id ?
						{kind: "local"} :
					!!user.connection ?
						{kind: "connected"} :
						{kind: "connecting"}
				),
			})),
		}
	}

	#closed() {
		this.stopRtcStats()
		this.stopSignallerStats()
		this.stopUpdates()
	}

	findUser(id: string) {
		return [...this.users.value].find(u => u.id === id)
	}

	killUser(id: string) {
		const user = this.findUser(id)
		if (user) {
			const {connection} = user
			if (connection) {
				connection.cable.reliable.close()
				connection.cable.unreliable.close()
				connection.disconnect()
			}
		}
	}

	getConnections() {
		return [...this.users.value]
			.map(p => p.connection)
			.filter(c => !!c)
	}

	async #refreshRtcStats() {
		const promises: Promise<void>[] = []
		for (const user of this.users.value) {
			if (user.connection) {
				promises.push(
					reportConnectivity(user.connection.peer)
						.then(report => { user.report = report })
						.catch(() => { user.report = null })
				)
			}
		}
		await Promise.all(promises)
		this.users.publish()
	}

	async #broadcastLobby() {
		const lobby = this.getLobby()
		for (const connection of this.getConnections())
			connection.cable.reliable.send(JSON.stringify(lobby))
	}
}

