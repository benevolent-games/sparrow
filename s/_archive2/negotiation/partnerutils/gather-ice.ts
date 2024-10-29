
import {SendIceCandidateFn} from "../types.js"
import {ConnectionReport} from "./connection-report.js"
import {attachEvents} from "../../tools/attach-events.js"

export function gather_ice(
		peer: RTCPeerConnection,
		sendIceCandidate: SendIceCandidateFn,
		report: ConnectionReport,
	) {

	return new Promise<void>((resolve, reject) => {
		const unattach = attachEvents(peer, {

			icecandidate: (event: RTCPeerConnectionIceEvent) => {
				if (event.candidate) {
					sendIceCandidate(event.candidate)
					report.iceCount += 1
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
				if (peer.connectionState === "failed") {
					unattach()
					reject(new Error("connection failed"))
				}
			},
		})
	})
}

