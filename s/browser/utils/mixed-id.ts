
import {AgentInfo} from "../../signaller/types.js"

export function mixedId({reputation, id}: AgentInfo) {
	return `${reputation.slice(0, 4)}:${id.slice(0, 4)}`
}

