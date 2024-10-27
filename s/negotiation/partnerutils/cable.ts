
import {pubsub} from "../../tools/pubsub.js"
import {ConnectionReport} from "./connection-report.js"
import {AgentInfo} from "../../signaling/agent/types.js"
import {attachEvents} from "../../tools/attach-events.js"

export class Cable<Channels> {

	get id() { return this.agent.id }
	get reputation() { return this.agent.reputation }

	readonly onClosed = pubsub()

	constructor(
			public agent: AgentInfo,
			public channels: Channels,
			public peer: RTCPeerConnection,
			public report: ConnectionReport,
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

