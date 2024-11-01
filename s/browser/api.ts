
import {AgentInfo} from "../signaling/types.js"
import {PartnerOptions} from "../negotiation/types.js"
import {makePartnerApi} from "../negotiation/partner-api.js"

export type BrowserApi = ReturnType<typeof makeBrowserApi>

export const makeBrowserApi = <Channels>(options: {
		partner: PartnerOptions<Channels>
		allow: (agent: AgentInfo) => Promise<boolean>
	}) => ({

	partner: makePartnerApi(options.partner),

	/** somebody wants to join a room you are hosting.. will you allow it? */
	async knock(agent: AgentInfo) {
		return await options.allow(agent)
	},
})

