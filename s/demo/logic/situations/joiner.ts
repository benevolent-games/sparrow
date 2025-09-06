
import {signal} from "@e280/strata"
import {Lobby} from "../types.js"
import {StdCable} from "../../../browser/types.js"
import {Sparrow} from "../../../browser/sparrow.js"
import {SparrowJoin} from "../../../browser/join.js"

export class JoinerSituation {
	static async start(url: string, invite: string, disconnected: () => void) {
		const joined = await Sparrow.join<StdCable>({
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
			public joined: SparrowJoin
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

