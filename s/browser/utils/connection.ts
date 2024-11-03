
import {ev, pubsub} from "@benev/slate"
import {StdDataCable} from "../types.js"
import {IceReport} from "./ice-report.js"
import {AgentInfo} from "../../signaling/types.js"

export class Connection<Cable = StdDataCable> {
	readonly onClosed = pubsub()

	get id() { return this.agent.id }
	get reputation() { return this.agent.reputation }

	constructor(
			public agent: AgentInfo,
			public peer: RTCPeerConnection,
			public cable: Cable,
			public iceReport: IceReport,
		) {

		const detach = ev(peer, {
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

