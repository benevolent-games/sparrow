
import {BrowserApi} from "../browser2/api.js"
import {Agent} from "../signaling/parts/agent.js"

export type Partner = {
	api: BrowserApi
	agent: Agent
}

