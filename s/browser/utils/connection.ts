
import {ev, pubsub} from "@benev/slate"
import {StdCable} from "../types.js"
import {IceReport} from "./ice-report.js"
import {AgentInfo} from "../../signaller/types.js"

export class Connection<Cable = StdCable> {
	readonly onDisconnected = pubsub()
	readonly onStabilityUpdate = pubsub<[boolean]>()

	get id() { return this.agent.id }
	get reputation() { return this.agent.reputation }

	constructor(
			public agent: AgentInfo,
			public peer: RTCPeerConnection,
			public cable: Cable,
			public conduit: RTCDataChannel,
			public iceReport: IceReport,
		) {

		// react to changes in the peer connectionState
		const detach = ev(peer, {
			connectionstatechange: () => {
				switch (peer.connectionState) {

					case "connected":
						return this.onStabilityUpdate.publish(true)

					case "disconnected":
						return this.onStabilityUpdate.publish(false)

					case "closed": case "failed":
						this.onStabilityUpdate.publish(false)
						detach()
						return this.onDisconnected.publish()
				}
			},
		})

		// react to the other end declaring "bye"
		conduit.onmessage = event => {
			if (event.data === "bye") {
				this.peer.close()
				this.onDisconnected.publish()
			}
		}
	}

	/** manually kill this connection */
	disconnect() {
		if (this.peer.connectionState !== "closed") {
			this.conduit.send("bye")
			this.peer.close()
			this.onDisconnected.publish()
		}
	}
}

