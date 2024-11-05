
import {Agent} from "./agent.js"
import {Map2, Pool} from "@benev/slate"

export class Agents extends Pool<Agent> {
	invites = new Map2<string, Agent>()

	delete(id: string) {
		const agent = this.get(id)

		// delete all invites associated with this agent
		if (agent)
			for (const invite of agent.invites)
				this.invites.delete(invite)

		return super.delete(id)
	}

	clear() {
		this.invites.clear()
		return super.clear()
	}
}

