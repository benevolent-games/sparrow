
import {concurrent} from "@e280/stz"
import {asCableConfig, StdCable} from "../types.js"
import {DataChanneller} from "../utils/data-channeller.js"

export const stdCable = () => asCableConfig<StdCable>({

	offering: async peer => {
		return concurrent({
			reliable: DataChanneller.offering(peer, "reliable", {
				ordered: true,
			}),
			unreliable: DataChanneller.offering(peer, "unreliable", {
				ordered: false,
				maxRetransmits: 0,
			}),
		})
	},

	answering: async peer => {
		return concurrent({
			reliable: DataChanneller.answering(peer, "reliable"),
			unreliable: DataChanneller.answering(peer, "unreliable"),
		})
	},
})

