
import {ev} from "@benev/slate"

export const DataChanneler = {

	async offering(peer: RTCPeerConnection, label: string, options?: RTCDataChannelInit) {
		return new Promise<RTCDataChannel>((resolve, reject) => {
			const channel = peer.createDataChannel(label, options)
			channel.binaryType = "arraybuffer"
			channel.onopen = () => resolve(channel)
			channel.onerror = () => reject(new Error(`failed to offer rtc data channel "${label}"`))
		})
	},

	async answering(peer: RTCPeerConnection, label: string) {
		return new Promise<RTCDataChannel>(resolve => {
			const detach = ev(peer, {
				datachannel: ({channel}: RTCDataChannelEvent) => {
					if (channel.label === label) {
						detach()
						resolve(channel)
					}
				},
			})
		})
	},
}

