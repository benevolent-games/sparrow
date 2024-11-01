
import {Map2, Pool} from "@benev/slate"
import {Agent} from "./agent.js"

export class Agents extends Pool<Agent> {
	invites = new Map2<string, Agent>()

	add(agent: Agent) {
		this.invites.set(agent.invite, agent)
		return super.add(agent)
	}

	remove(agent: Agent) {
		this.invites.delete(agent.invite)
		return super.remove(agent)
	}

	set(id: string, agent: Agent) {
		this.invites.set(agent.invite, agent)
		return super.set(id, agent)
	}

	delete(id: string) {
		const agent = this.get(id)
		if (agent)
			this.invites.delete(agent.invite)
		return super.delete(id)
	}

	clear() {
		this.invites.clear()
		return super.clear()
	}
}

