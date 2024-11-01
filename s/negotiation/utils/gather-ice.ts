
import {IceReport} from "../ice-report.js"
import {SendIceCandidateFn} from "../types.js"
import {attachEvents} from "../../tools/attach-events.js"

export function gather_ice(
		peer: RTCPeerConnection,
		sendIceCandidate: SendIceCandidateFn,
		iceReport: IceReport,
	) {

	return new Promise<void>((resolve, reject) => {
		const unattach = attachEvents(peer, {

			icecandidate: (event: RTCPeerConnectionIceEvent) => {
				if (event.candidate) {
					sendIceCandidate(event.candidate)
					iceReport.locals.push(event.candidate)
				}
			},

			icecandidateerror: () => {
				unattach()
				reject(new Error("ice gathering failed"))
			},

			icegatheringstatechange: () => {
				if (peer.iceGatheringState === "complete") {
					unattach()
					resolve()
				}
			},

			connectionstatechange: () => {
				switch (peer.connectionState) {
					case "failed":
					case "closed":
						unattach()
						reject(new Error("connection failed"))
				}
			},
		})
	})
}

