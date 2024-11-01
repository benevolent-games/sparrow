
import {SignalingApi} from "../signaling/api.js"
import {AgentConfidential} from "../signaling/agent/types.js"
import {Connections} from "../negotiation/utils/connections.js"

import {join} from "./std/join.js"
import {connect} from "./std/connect.js"
import {everybody} from "./std/everybody.js"

import {stdUrl} from "./std/std-url.js"
import {stdOptions} from "./std/std-options.js"
import {stdRtcConfig} from "./std/std-rtc-config.js"
import {stdDataCable} from "./std/std-data-cable.js"
import {StdDataCable} from "../negotiation/types.js"

export class Sparrow<Cable = StdDataCable> {
	static join = join
	static connect = connect
	static everybody = everybody
	static stdUrl = stdUrl
	static stdOptions = stdOptions
	static stdRtcConfig = stdRtcConfig
	static stdDataCable = stdDataCable

	#connections: Connections<Cable>

	constructor(
			private socket: WebSocket,
			private signalingApi: SignalingApi,
			public agent: AgentConfidential,
			connections: Connections<Cable>,
		) {
		this.#connections = connections
	}

	get id() { return this.agent.id }
	get invite() { return this.agent.invite }
	get reputation() { return this.agent.reputation }

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

