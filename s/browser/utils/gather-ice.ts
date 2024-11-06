
import {ev} from "@benev/slate"
import {IceReport} from "./ice-report.js"
import {SendIceCandidateFn} from "../types.js"

export function gather_ice(
		peer: RTCPeerConnection,
		sendIceCandidate: SendIceCandidateFn,
		iceReport: IceReport,
	) {

	let failures = 0
	const logFailures = () => {
		if (failures > 0)
			console.error(`${failures} local ice candidates failed`)
	}

	return new Promise<void>((resolve, reject) => {
		const unattach = ev(peer, {

			icecandidate: (event: RTCPeerConnectionIceEvent) => {
				if (event.candidate) {
					sendIceCandidate(event.candidate)
					iceReport.recordLocal(event.candidate)
				}
			},

			icecandidateerror: (event: RTCPeerConnectionIceErrorEvent) => {
				console.error("ice candidate error:", event.errorCode, event.errorText, event.url)
				failures += 1
			},

			icegatheringstatechange: () => {
				if (peer.iceGatheringState === "complete") {
					logFailures()
					unattach()
					resolve()
				}
			},

			connectionstatechange: () => {
				switch (peer.connectionState) {
					case "failed":
					case "closed":
						logFailures()
						unattach()
						reject(new Error("connection failed"))
				}
			},
		})
	})
}

