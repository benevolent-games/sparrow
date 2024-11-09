
import {signal} from "@benev/slate"
import {Lobby} from "../types.js"
import {Joined} from "../../../browser/join.js"
import {StdCable} from "../../../browser/types.js"
import {Sparrow} from "../../../browser/sparrow.js"
import {customRtcConfig} from "./custom-rtc-config.js"

export class JoinerSituation {
	static async start(url: string, invite: string, disconnected: () => void) {
		const joined = await Sparrow.join<StdCable>({
			url,
			rtcConfig: customRtcConfig(),
			invite,
			disconnected,
		})
		return new JoinerSituation(url, joined)
	}

	lobby = signal<Lobby | null>(null)

	constructor(
			public url: string,
			public joined: Joined
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

