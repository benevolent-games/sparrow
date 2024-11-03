
import {deferPromise, pubsub} from "@benev/slate"

import {IceReport} from "./ice-report.js"
import {Connection} from "./connection.js"
import {gather_ice} from "./gather-ice.js"
import {ProspectOptions} from "../types.js"
import {AgentInfo} from "../../signaling/types.js"
import {wait_for_connection} from "./wait-for-connection.js"

export class Prospect<Cable> {
	get id() { return this.agent.id }
	get reputation() { return this.agent.reputation }

	onChange = pubsub()

	agent: AgentInfo
	peer: RTCPeerConnection
	iceReport = new IceReport()

	iceGatheredPromise: Promise<void>
	peerPromise: Promise<RTCPeerConnection>
	cableWait = deferPromise<Cable>()

	connection: Connection<Cable> | null = null
	readyPromise: Promise<Connection<Cable>>

	onDead = pubsub()

	constructor(options: ProspectOptions) {
		this.agent = options.agent
		this.peer = new RTCPeerConnection(options.rtcConfig)
		this.peerPromise = wait_for_connection(this.peer)
		this.iceGatheredPromise = gather_ice(
			this.peer,
			options.sendIceCandidate,
			this.iceReport,
		)

		this.readyPromise = (
			Promise.all([
				this.cableWait.promise,
				this.peerPromise,
				this.iceGatheredPromise,
			])

			.then(([cable]) => {
				const connection = this.connection = new Connection<Cable>(
					this.agent,
					this.peer,
					cable,
					this.iceReport,
				)
				connection.onClosed(() => this.close())
				this.onChange.publish()
				return connection
			})

			.catch(error => {
				this.close()
				throw error
			})
		)
	}

	async acceptIceCandidate(candidate: RTCIceCandidate) {
		this.iceReport.recordRemote(candidate)
		await this.peer.addIceCandidate(candidate)
	}

	async handleFailure<R>(fn: () => Promise<R>) {
		try { return await fn() }
		catch (error) {
			this.cableWait.reject(error)
			this.close()
			throw error
		}
	}

	close() {
		this.connection = null
		this.peer.close()
		this.onDead.publish()
		this.onChange.publish()
	}
}

