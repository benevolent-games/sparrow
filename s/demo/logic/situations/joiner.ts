
import {signal} from "@e280/strata"
import {Lobby} from "../types.js"
import * as Sparrow from "../../../browser/index.js"

export class JoinerSituation {
	static async start(url: string, invite: string, disconnected: () => void) {
		const joined = await Sparrow.join<Sparrow.StdCable>({
			url,
			invite,
			disconnected,
			rtcConfigurator: Sparrow.turnRtcConfigurator,
		})
		return new JoinerSituation(url, joined)
	}

	lobby = signal<Lobby | null>(null)

	constructor(
			public url: string,
			public joined: Sparrow.Join,
		) {

		joined.connection.cable.reliable.onmessage = event => {
			this.lobby.value = JSON.parse(event.data)
		}
	}

	kill() {
		this.joined.connection.cable.reliable.close()
		this.joined.connection.cable.unreliable.close()
		this.joined.connection.disconnect()
	}
}

