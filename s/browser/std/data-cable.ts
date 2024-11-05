
import {concurrent} from "@benev/slate"
import {asCableConfig, StdDataCable} from "../types.js"
import {DataChanneler} from "../utils/data-channeler.js"

export const stdDataCable = () => asCableConfig<StdDataCable>({

	offering: async peer => {
		return concurrent({
			reliable: DataChanneler.offering(peer, "reliable", {
				ordered: true,
			}),
			unreliable: DataChanneler.offering(peer, "unreliable", {
				ordered: false,
				maxRetransmits: 0,
			}),
		})
	},

	answering: async peer => {
		return concurrent({
			reliable: DataChanneler.answering(peer, "reliable"),
			unreliable: DataChanneler.answering(peer, "unreliable"),
		})
	},
})

