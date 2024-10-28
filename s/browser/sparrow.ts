
import {Pubsub} from "../tools/pubsub.js"

import {SignalingApi} from "../signaling/api.js"
import {Cable} from "../negotiation/partnerutils/cable.js"
import {AgentConfidential} from "../signaling/agent/types.js"
import {ConnectionReport} from "../negotiation/partnerutils/connection-report.js"

import {connect} from "./std/connect.js"
import {everybody} from "./std/everybody.js"

import {join} from "./std/join.js"
import {stdUrl} from "./std/std-url.js"
import {stdOptions} from "./std/std-options.js"
import {stdRtcConfig} from "./std/std-rtc-config.js"
import {stdDataChannels} from "./std/std-data-channels.js"

export class Sparrow<Channels> {
	constructor(
		public socket: WebSocket,
		public signalingApi: SignalingApi,
		public self: AgentConfidential,
		public onCable: Pubsub<[Cable<Channels>]>,
		public onReport: Pubsub<[ConnectionReport]>,
	) {}

	static join = join
	static connect = connect
	static everybody = everybody
	static stdUrl = stdUrl
	static stdOptions = stdOptions
	static stdRtcConfig = stdRtcConfig
	static stdDataChannels = stdDataChannels

	get id() { return this.self.id }
	get invite() { return this.self.invite }
	get reputation() { return this.self.reputation }

	async stats() {
		return await this.signalingApi.stats()
	}

	async join(invite: string) {
		return await this.signalingApi.join(invite)
	}

	close() {
		this.socket.close()
	}
}

