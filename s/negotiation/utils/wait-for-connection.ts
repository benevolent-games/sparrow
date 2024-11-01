
import {attachEvents} from "../../tools/attach-events.js"

export function wait_for_connection(peer: RTCPeerConnection) {
	return new Promise<RTCPeerConnection>((resolve, reject) => {
		const detach = attachEvents(peer, {
			connectionstatechange: () => {
				switch (peer.connectionState) {

					case "connected":
						detach()
						return resolve(peer)

					case "failed":
						detach()
						return reject(new Error("connection failed"))

					case "closed":
						detach()
						return reject(new Error("connection closed"))
				}
			},
		})
	})
}

