
import {Map2} from "@benev/slate"
import {Agent} from "./parts/agent.js"
import {makeSignallerApi} from "./api.js"
import {SignallerParams} from "./types.js"
import {BrowserApi} from "../browser/api.js"
import {SimpleHeaders} from "renraku/x/server.js"
import {Statistician} from "./parts/statistician.js"

export class Core {
	agents = new Set<Agent>()
	invites = new Map2<string, Agent>()
	statistician = new Statistician(this.agents)

	constructor(private params: SignallerParams) {}

	async acceptAgent(
			ip: string,
			headers: SimpleHeaders,
			browserApi: BrowserApi,
			disconnect: () => void,
		) {

		const agent = await Agent.make(
			ip,
			browserApi,
			disconnect,
			this.params.salt,
		)

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

