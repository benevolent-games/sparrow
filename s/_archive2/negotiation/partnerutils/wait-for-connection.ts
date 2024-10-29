
import {attachEvents} from "../../tools/attach-events.js"

export function wait_for_connection(peer: RTCPeerConnection) {
	return new Promise<RTCPeerConnection>((resolve, reject) => {
		const unattach = attachEvents(peer, {
			connectionstatechange: () => {
				if (peer.connectionState === "connected") {
					unattach()
					resolve(peer)
				}
				else if (peer.connectionState === "failed") {
					unattach()
					reject(new Error("connection failed"))
				}
			},
		})
	})
}

