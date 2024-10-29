
import {SignalingApi} from "../signaling/api.js"
import {AgentConfidential} from "../signaling/agent/types.js"
import {Connections} from "../negotiation/partnerutils/connections.js"

import {join} from "./std/join.js"
import {connect} from "./std/connect.js"
import {everybody} from "./std/everybody.js"

import {stdUrl} from "./std/std-url.js"
import {stdOptions} from "./std/std-options.js"
import {stdRtcConfig} from "./std/std-rtc-config.js"
import {stdDataCable} from "./std/std-data-cable.js"

export class Sparrow<Channels> {
	static join = join
	static connect = connect
	static everybody = everybody
	static stdUrl = stdUrl
	static stdOptions = stdOptions
	static stdRtcConfig = stdRtcConfig
	static stdDataCable = stdDataCable

	#connections: Connections<Channels>

	constructor(
			private socket: WebSocket,
			private signalingApi: SignalingApi,
			private self: AgentConfidential,
			connections: Connections<Channels>,
		) {
		this.#connections = connections
	}

	get id() { return this.self.id }
	get invite() { return this.self.invite }
	get reputation() { return this.self.reputation }

	get onConnectionAdded() { return this.#connections.onConnectionAdded }
	get onConnectionRemoved() { return this.#connections.onConnectionRemoved }
	get onConnected() { return this.#connections.onConnected }
	get onChange() { return this.#connections.onChange }

	get connections() {
		return [...this.#connections.values()]
	}

	get currentlyConnecting() {
		return this.connections
			.filter(connection => !connection.connected)
	}

	get connected() {
		return [...this.#connections.values()]
			.map(connection => connection.connected)
			.filter(connected => !!connected)
	}

	async stats() {
		return await this.signalingApi.stats()
	}

	async join(invite: string) {
		const agent = await this.signalingApi.join(invite)
		if (agent) {
			const connection = this.#connections.require(agent.id)
			return await connection.connectedPromise
		}
		else return null
	}

	close() {
		this.socket.close()
	}
}

