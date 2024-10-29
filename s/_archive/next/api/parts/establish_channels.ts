
import {EstablishChannels} from "../../types.js"
import {concurrent} from "../../../toolbox/concurrent.js"
import {openPromise} from "../../../toolbox/open-promise.js"
import {attachEvents} from "../../../toolbox/attach-events.js"

// TODO rename to 'channelsConfig'
// and make standardChannelsConfig and standardDataChannels functions that return the good stuff

export function asChannelEstablisher<E extends EstablishChannels<unknown>>(e: E) {
	return e
}

export type StandardDataChannels = {
	reliable: RTCDataChannel
	unreliable: RTCDataChannel
}

export const standardDataChannels: EstablishChannels<StandardDataChannels> = ({

	offering: async peer => {
		function channelize(channel: RTCDataChannel) {
			channel.binaryType = "arraybuffer"
			const waiting = openPromise<RTCDataChannel>()
			const unattach = attachEvents(channel, {
				open: () => waiting.resolve(channel),
				error: (e: RTCErrorEvent) => waiting.reject(e.error),
			})
			return waiting.promise.finally(unattach)
		}
		return concurrent({
			reliable: channelize(peer.createDataChannel("reliable", {
				ordered: true,
			})),
			unreliable: channelize(peer.createDataChannel("unreliable", {
				ordered: true,
				maxRetransmits: 0,
			})),
		})
	},

	answering: async peer => {
		const waiting = {
			reliable: openPromise<RTCDataChannel>(),
			unreliable: openPromise<RTCDataChannel>(),
		}
		const unattach = attachEvents(peer, {
			datachannel: ({channel}: RTCDataChannelEvent) => {
				if (channel.label in waiting) {
					const key = channel.label as keyof typeof waiting
					waiting[key].resolve(channel)
				}
				else throw new Error(`unknown data channel "${channel.label}"`)
			},
		})
		return concurrent({
			reliable: waiting.reliable.promise,
			unreliable: waiting.unreliable.promise,
		}).finally(unattach)
	},
})

