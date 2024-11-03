
import {CableConfig, StdDataCable} from "../types.js"
import {concurrent, deferPromise, ev} from "@benev/slate"

export const stdDataCable = (): CableConfig<StdDataCable> => ({

	offering: async peer => {
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
			reliable: deferPromise<RTCDataChannel>(),
			unreliable: deferPromise<RTCDataChannel>(),
		}

		const unattach = ev(peer, {
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

function prepareChannel(channel: RTCDataChannel) {
	channel.binaryType = "arraybuffer"
	const waiting = deferPromise<RTCDataChannel>()
	const unattach = ev(channel, {
		open: () => waiting.resolve(channel),
		error: (e: RTCErrorEvent) => waiting.reject(e.error),
	})
	return waiting.promise.finally(unattach)
}

