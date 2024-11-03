
import {signal} from "@benev/slate"
import {Lobby} from "../types.js"
import {Joined} from "../../../browser/join.js"

export class JoinerSituation {
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
		this.joined.prospect.close()
		this.joined.close()
	}
}

