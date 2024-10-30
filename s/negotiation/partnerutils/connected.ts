
import {StdDataCable} from "../types.js"
import {IceReport} from "../ice-report.js"
import {pubsub} from "../../tools/pubsub.js"
import {AgentInfo} from "../../signaling/agent/types.js"
import {attachEvents} from "../../tools/attach-events.js"

export class Connected<Cable = StdDataCable> {
	get id() { return this.agent.id }
	get reputation() { return this.agent.reputation }

	readonly onClosed = pubsub()

	constructor(
			public agent: AgentInfo,
			public peer: RTCPeerConnection,
			public cable: Cable,
			public iceReport: IceReport,
		) {

		const detach = attachEvents(peer, {
			connectionstatechange: () => {
				switch (peer.connectionState) {
					case "closed":
					case "failed":
						detach()
						return this.onClosed.publish()
				}
			},
		})
	}
}

