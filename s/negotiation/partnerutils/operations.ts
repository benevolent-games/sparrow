
import {deferPromise, pubsub} from "@benev/slate"

import {Connected} from "./connected.js"
import {Pool} from "../../tools/map2.js"
import {IceReport} from "../ice-report.js"
import {gather_ice} from "./gather-ice.js"
import {SendIceCandidateFn} from "../types.js"
import {AgentInfo} from "../../signaling/agent/types.js"
import {wait_for_connection} from "./wait-for-connection.js"

export type OperationOptions = {
	agent: AgentInfo
	rtcConfig: RTCConfiguration
	sendIceCandidate: SendIceCandidateFn
}

export class Operations<Channels> extends Pool<Operation<Channels>> {
	onOperationAdded = pubsub<[Operation<Channels>]>()
	onOperationRemoved = pubsub<[Operation<Channels>]>()
	onConnected = pubsub<[Connected<Channels>]>()

	onChange = pubsub()

	constructor() {
		super()

		// publish onChange when any event happens
		const change = () => this.onChange.publish()
		this.onOperationAdded(change)
		this.onOperationRemoved(change)
		this.onConnected(change)
	}

	create(options: OperationOptions) {
		if (this.has(options.agent.id))
			throw new Error("already engaged with this agent")

		const operation = new Operation<Channels>(options)
		this.add(operation)
		this.onOperationAdded.publish(operation)

		const remove = () => {
			this.remove(operation)
			this.onOperationRemoved.publish(operation)
		}

		// remove the operation when it dies
		operation.onDead(remove)

		// publish onConnected when connection is complete
		operation.connectedPromise.then(connected => this.onConnected.publish(connected))

		return operation
	}

	async attempt<R>(id: string, fn: (operation: Operation<Channels>) => Promise<R>) {
		const operation = this.require(id)
		return await operation.handleFailure(async() => await fn(operation))
	}
}

export class Operation<Channels> {
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

	constructor(public options: OperationOptions) {
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

