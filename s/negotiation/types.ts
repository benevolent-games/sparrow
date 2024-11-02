
import {BrowserApi} from "../browser/api.js"
import {Agent} from "../signaling/parts/agent.js"

export type Partner = {
	api: BrowserApi
	agent: Agent
}

