
import {ev} from "@e280/stz"

export function wait_for_connection(peer: RTCPeerConnection) {
	return new Promise<RTCPeerConnection>((resolve, reject) => {
		const detach = ev(peer, {
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

