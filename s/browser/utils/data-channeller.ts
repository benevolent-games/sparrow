
import {ev} from "@benev/slate"
import {messageBuffering} from "./message-buffering.js"

export const DataChanneller = {

	async offering(peer: RTCPeerConnection, label: string, options?: RTCDataChannelInit) {
		return new Promise<RTCDataChannel>((resolve, reject) => {
			const channel = messageBuffering(peer.createDataChannel(label, options))
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
						channel.binaryType = "arraybuffer"
						detach()
						resolve(messageBuffering(channel))
					}
				},
			})
		})
	},
}

