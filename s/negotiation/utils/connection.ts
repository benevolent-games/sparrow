//
// import {deferPromise, pubsub} from "@benev/slate"
//
// import {Connected} from "./connected.js"
// import {IceReport} from "./ice-report.js"
// import {gather_ice} from "./gather-ice.js"
// import {ConnectionOptions} from "../types.js"
// import {AgentInfo} from "../../signaling/types.js"
// import {wait_for_connection} from "./wait-for-connection.js"
//
// export class Connection<Cable> {
// 	agent: AgentInfo
// 	peer: RTCPeerConnection
// 	iceReport = new IceReport()
//
// 	iceGatheredPromise: Promise<void>
// 	connectionPromise: Promise<RTCPeerConnection>
// 	cableWait = deferPromise<Cable>()
//
// 	connected: Connected<Cable> | null = null
// 	connectedPromise: Promise<Connected<Cable>>
//
// 	onDead = pubsub()
//
// 	get id() { return this.agent.id }
// 	get reputation() { return this.agent.reputation }
//
// 	constructor(public options: ConnectionOptions) {
// 		this.agent = options.agent
// 		this.peer = new RTCPeerConnection(options.rtcConfig)
// 		this.connectionPromise = wait_for_connection(this.peer)
// 		this.iceGatheredPromise = gather_ice(
// 			this.peer,
// 			options.sendIceCandidate,
// 			this.iceReport,
// 		)
//
// 		this.connectedPromise = (
// 			Promise.all([
// 				this.cableWait.promise,
// 				this.connectionPromise,
// 				this.iceGatheredPromise,
// 			])
//
// 			.then(([cable]) => {
// 				const connected = this.connected = new Connected<Cable>(
// 					this.agent,
// 					this.peer,
// 					cable,
// 					this.iceReport,
// 				)
// 				connected.onClosed(() => this.close())
// 				return connected
// 			})
//
// 			.catch(error => {
// 				this.close()
// 				throw error
// 			})
// 		)
// 	}
//
// 	async acceptIceCandidate(candidate: RTCIceCandidate) {
// 		this.iceReport.remotes.push(candidate)
// 		await this.peer.addIceCandidate(candidate)
// 	}
//
// 	async handleFailure<R>(fn: () => Promise<R>) {
// 		try { return await fn() }
// 		catch (error) {
// 			this.cableWait.reject(error)
// 			this.close()
// 			throw error
// 		}
// 	}
//
// 	close() {
// 		this.peer.close()
// 		this.onDead.publish()
// 	}
// }
//
