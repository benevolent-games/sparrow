
import {Pubsub} from "../tools/pubsub.js"
import {SignalingApi} from "../signaling/api.js"
import {Cable} from "../negotiation/partnerutils/cable.js"
import {AgentConfidential} from "../signaling/agent/types.js"
import {ConnectionReport} from "../negotiation/partnerutils/connection-report.js"

export class Sparrow<Channels> {
	constructor(
		public socket: WebSocket,
		public signalingApi: SignalingApi,
		public self: AgentConfidential,
		public onCable: Pubsub<[Cable<Channels>]>,
		public onReport: Pubsub<[ConnectionReport]>,
	) {}

	close() {
		this.socket.close()
	}
}

