
import {concurrent} from "../../tools/concurrent.js"
import {attachEvents} from "../../tools/attach-events.js"
import {deferredPromise} from "../../tools/deferred-promise.js"
import {ChannelsConfig, StdDataChannels} from "../../negotiation/types.js"

export const stdDataChannels = (): ChannelsConfig<StdDataChannels> => ({

	offering: async peer => {
		function prepareChannel(channel: RTCDataChannel) {
			channel.binaryType = "arraybuffer"
			const waiting = deferredPromise<RTCDataChannel>()
			const unattach = attachEvents(channel, {
				open: () => waiting.resolve(channel),
				error: (e: RTCErrorEvent) => waiting.reject(e.error),
			})
			return waiting.promise.finally(unattach)
		}

		return concurrent({
			reliable: prepareChannel(peer.createDataChannel("reliable", {
				ordered: true,
			})),
			unreliable: prepareChannel(peer.createDataChannel("unreliable", {
				ordered: true,
				maxRetransmits: 0,
			})),
		})
	},

	answering: async peer => {
		const waiting = {
			reliable: deferredPromise<RTCDataChannel>(),
			unreliable: deferredPromise<RTCDataChannel>(),
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

