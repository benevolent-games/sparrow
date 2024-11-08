
import {Map2} from "@benev/slate"
import {Agent} from "./parts/agent.js"
import {makeSignallerApi} from "./api.js"
import {BrowserApi} from "../browser/api.js"
import {Statistician} from "./parts/statistician.js"

export class Core {
	agents = new Set<Agent>()
	invites = new Map2<string, Agent>()
	statistician = new Statistician(this.agents)

	constructor(private salt: string) {}

	async acceptAgent(
			ip: string,
			browserApi: BrowserApi,
			disconnect: () => void,
		) {

		// create the agent
		const agent = await Agent.make(ip, browserApi, disconnect, this.salt)
		this.agents.add(agent)

		// create the api available to this agent
		const signallerApi = makeSignallerApi(this, agent)

		return {agent, signallerApi}
	}

	deleteAgent(agent: Agent) {
		this.agents.delete(agent)
		for (const invite of agent.invites)
			this.invites.delete(invite)
	}
}

