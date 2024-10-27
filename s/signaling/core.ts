
import {Agent} from "./agent/agent.js"
import {Agents} from "./agent/agents.js"
import {makeSignalingApi} from "./api.js"
import {BrowserApi} from "../browser/api.js"

export class Core {
	agents = new Agents()

	async acceptAgent(
			ip: string,
			browserApi: BrowserApi,
			disconnect: () => void,
		) {

		// create the agent
		const agent = await Agent.make(ip, browserApi, disconnect)
		this.agents.add(agent)

		// create the api available to this agent
		const signalingApi = makeSignalingApi(this, agent)

		return {agent, signalingApi}
	}

	agentDisconnected(agent: Agent) {
		this.agents.remove(agent)
	}
}

