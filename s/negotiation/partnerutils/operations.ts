
import {deferPromise, pubsub} from "@benev/slate"

import {Cable} from "./cable.js"
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
	onCable = pubsub<[Cable<Channels>]>()

	onChange = pubsub()

	constructor() {
		super()

		// publish onChange when any event happens
		const change = () => this.onChange.publish()
		this.onOperationAdded(change)
		this.onOperationRemoved(change)
		this.onCable(change)
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

		// publish onCable when the cable comes in
		operation.cablePromise.then(cable => this.onCable.publish(cable))

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
	connectedPromise: Promise<RTCPeerConnection>
	channelsWaiting = deferPromise<Channels>()

	cable: Cable<Channels> | null = null
	cablePromise: Promise<Cable<Channels>>

	onDead = pubsub()

	get id() { return this.agent.id }
	get reputation() { return this.agent.reputation }

	constructor(public options: OperationOptions) {
		this.agent = options.agent
		this.peer = new RTCPeerConnection(options.rtcConfig)
		this.iceGatheredPromise = gather_ice(this.peer, options.sendIceCandidate, this.iceReport)
		this.connectedPromise = wait_for_connection(this.peer)

		this.cablePromise = (
			Promise.all([
				this.channelsWaiting.promise,
				this.connectedPromise,
				this.iceGatheredPromise,
			])
			.then(([channels]) => {
				const cable = this.cable = new Cable<Channels>(
					this.agent,
					this.peer,
					channels,
					this.iceReport,
				)
				cable.onClosed(() => this.die())
				return cable
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

