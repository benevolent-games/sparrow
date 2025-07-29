
import {MapG} from "@e280/stz"
import {SimpleHeaders} from "@e280/renraku"

import {Agent} from "./parts/agent.js"
import {makeSignallerApi} from "./api.js"
import {SignallerParams} from "./types.js"
import {BrowserApi} from "../browser/api.js"
import {Statistician} from "./parts/statistician.js"

export class Core {
	agents = new Set<Agent>()
	invites = new MapG<string, Agent>()
	statistician = new Statistician(this.agents)

	constructor(private params: SignallerParams) {}

	async acceptAgent(
			reputation: string,
			headers: SimpleHeaders,
			browserApi: BrowserApi,
			disconnect: () => void,
		) {

		const agent = new Agent(reputation, browserApi, disconnect)
		this.agents.add(agent)

		const signallerApi = makeSignallerApi(
			this,
			agent,
			this.params,
			headers["origin"] ?? "",
		)

		return {agent, signallerApi}
	}

	deleteAgent(agent: Agent) {
		this.agents.delete(agent)
		for (const invite of agent.invites)
			this.invites.delete(invite)
	}
}

