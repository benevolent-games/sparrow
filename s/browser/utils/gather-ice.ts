
import {ev} from "@benev/slate"
import {IceReport} from "./ice-report.js"
import {SendIceCandidateFn} from "../types.js"

export function gather_ice(
		peer: RTCPeerConnection,
		sendIceCandidate: SendIceCandidateFn,
		iceReport: IceReport,
	) {

	return new Promise<void>((resolve, reject) => {
		const unattach = ev(peer, {

			icecandidate: (event: RTCPeerConnectionIceEvent) => {
				if (event.candidate) {
					console.log("NEW LOCAL ICE CANDIDATE")
					sendIceCandidate(event.candidate)
					iceReport.recordLocal(event.candidate)
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

