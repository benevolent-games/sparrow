
import {Pool} from "../../tools/map2.js"
import {gather_ice} from "./gather-ice.js"
import {SendIceCandidateFn} from "../types.js"
import {ConnectionReport} from "./connection-report.js"
import {AgentInfo} from "../../signaling/agent/types.js"
import {wait_for_connection} from "./wait-for-connection.js"
import {deferredPromise} from "../../tools/deferred-promise.js"

export type OperationOptions = {
	agent: AgentInfo
	rtcConfig: RTCConfiguration
	sendIceCandidate: SendIceCandidateFn
}

export class Operations<Channels> extends Pool<Operation<Channels>> {
	#id = 0

	create(options: OperationOptions) {
		const operation = new Operation<Channels>(this.#id++, options)
		this.add(operation)
		return operation
	}

	async attempt<R>(opId: number, fn: (operation: Operation<Channels>) => Promise<R>) {
		const operation = this.require(opId)
		return await operation.handleFailure(async() => await fn(operation))
	}
}

export class Operation<Channels> {
	agent: AgentInfo
	report: ConnectionReport
	peer: RTCPeerConnection
	iceGatheredPromise: Promise<void>
	connectedPromise: Promise<RTCPeerConnection>

	channelsWaiting = deferredPromise<Channels>()

	constructor(public id: number, public options: OperationOptions) {
		this.agent = options.agent
		this.report = new ConnectionReport(id, options.agent)
		this.peer = new RTCPeerConnection(options.rtcConfig)
		this.iceGatheredPromise = gather_ice(this.peer, options.sendIceCandidate, this.report)
		this.connectedPromise = wait_for_connection(this.peer)
	}

	async handleFailure<R>(fn: () => Promise<R>) {
		try { return await fn() }
		catch (err) {
			this.report.status = "failed"
			this.channelsWaiting.reject(err)
			throw err
		}
	}
}

