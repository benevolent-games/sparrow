
import {deferPromise, pubsub} from "@benev/slate"

import {Connected} from "./connected.js"
import {IceReport} from "../ice-report.js"
import {gather_ice} from "./gather-ice.js"
import {ConnectionOptions} from "../types.js"
import {AgentInfo} from "../../signaling/agent/types.js"
import {wait_for_connection} from "./wait-for-connection.js"

export class Connection<Channels> {
	agent: AgentInfo
	peer: RTCPeerConnection
	iceReport = new IceReport()

	iceGatheredPromise: Promise<void>
	connectionPromise: Promise<RTCPeerConnection>
	channelsWaiting = deferPromise<Channels>()

	connected: Connected<Channels> | null = null
	connectedPromise: Promise<Connected<Channels>>

	onDead = pubsub()

	get id() { return this.agent.id }
	get reputation() { return this.agent.reputation }

	constructor(public options: ConnectionOptions) {
		this.agent = options.agent
		this.peer = new RTCPeerConnection(options.rtcConfig)
		this.iceGatheredPromise = gather_ice(this.peer, options.sendIceCandidate, this.iceReport)
		this.connectionPromise = wait_for_connection(this.peer)

		this.connectedPromise = (
			Promise.all([
				this.channelsWaiting.promise,
				this.connectionPromise,
				this.iceGatheredPromise,
			])
			.then(([channels]) => {
				const connected = this.connected = new Connected<Channels>(
					this.agent,
					this.peer,
					channels,
					this.iceReport,
				)
				connected.onClosed(() => this.die())
				return connected
			})
			.catch(error => {
				this.die()
				throw error
			})
		)
	}

	async acceptIceCandidate(candidate: RTCIceCandidate) {
		this.iceReport.remotes.push(candidate)
		await this.peer.addIceCandidate(candidate)
	}

	async handleFailure<R>(fn: () => Promise<R>) {
		try { return await fn() }
		catch (error) {
			this.channelsWaiting.reject(error)
			this.die()
			throw error
		}
	}

	private die() {
		this.peer.close()
		this.onDead.publish()
	}
}

