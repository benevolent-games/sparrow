
import {AgentInfo} from "../../signaling/types.js"

export function mixedId({reputation, id}: AgentInfo) {
	return `${reputation.slice(0, 4)}:${id.slice(0, 4)}`
}

