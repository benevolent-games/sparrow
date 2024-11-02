
import {Agent} from "./parts/agent.js"
import {Agents} from "./parts/agents.js"
import {makeSignalingApi} from "./api.js"
import {BrowserApi} from "../browser/api.js"
import {Statistician} from "./parts/statistician.js"

export class Core {
	agents = new Agents()
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
		const signalingApi = makeSignalingApi(this, agent)

		return {agent, signalingApi}
	}

	agentDisconnected(agent: Agent) {
		this.agents.remove(agent)
	}
}

