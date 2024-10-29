
import {DoorPolicies} from "./parts/door-policies.js"
import {PartnerOptions} from "../negotiation/types.js"
import {PersonInfo} from "../signaling/parts/people.js"
import {makePartnerApi} from "../negotiation/partner-api.js"

export type BrowserApi = ReturnType<typeof makeBrowserApi>

export const makeBrowserApi = <Channels>(options: {
		partner: PartnerOptions<Channels>
		doorPolicies: DoorPolicies
	}) => ({

	partner: makePartnerApi(options.partner),

	/** somebody wants to join a room you are hosting.. will you allow it? */
	async knock(roomId: string, personInfo: PersonInfo) {
		const policy = options.doorPolicies.require(roomId)
		return await policy(personInfo)
	},
})

