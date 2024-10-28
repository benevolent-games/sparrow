
import {SignalingApi} from "../signaling/api.js"
import {AgentConfidential} from "../signaling/agent/types.js"

import {connect} from "./std/connect.js"
import {everybody} from "./std/everybody.js"

import {join} from "./std/join.js"
import {stdUrl} from "./std/std-url.js"
import {stdOptions} from "./std/std-options.js"
import {stdRtcConfig} from "./std/std-rtc-config.js"
import {stdDataChannels} from "./std/std-data-channels.js"
import {Operations} from "../negotiation/partnerutils/operations.js"

export class Sparrow<Channels> {
	static join = join
	static connect = connect
	static everybody = everybody
	static stdUrl = stdUrl
	static stdOptions = stdOptions
	static stdRtcConfig = stdRtcConfig
	static stdDataChannels = stdDataChannels

	#operations: Operations<Channels>

	constructor(
			private socket: WebSocket,
			private signalingApi: SignalingApi,
			private self: AgentConfidential,
			operations: Operations<Channels>,
		) {
		this.#operations = operations
	}

	get id() { return this.self.id }
	get invite() { return this.self.invite }
	get reputation() { return this.self.reputation }

	get onOperationAdded() { return this.#operations.onOperationAdded }
	get onOperationRemoved() { return this.#operations.onOperationRemoved }
	get onCable() { return this.#operations.onCable }
	get onChange() { return this.#operations.onChange }

	get operations() {
		return [...this.#operations.values()]
	}

	get currentlyConnecting() {
		return this.operations
			.filter(operation => !operation.cable)
	}

	get cables() {
		return [...this.#operations.values()]
			.map(operation => operation.cable)
			.filter(cable => !!cable)
	}

	async stats() {
		return await this.signalingApi.stats()
	}

	async join(invite: string) {
		const agent = await this.signalingApi.join(invite)
		if (agent) {
			const operation = this.#operations.require(agent.id)
			return await operation.cablePromise
		}
		else return null
	}

	close() {
		this.socket.close()
	}
}

