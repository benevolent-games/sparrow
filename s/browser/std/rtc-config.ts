
export const rtcConfig = {
	std: {
		iceServers: [
			{urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"]},
			{urls: ["stun:stun.services.mozilla.com:3478"]},
			{urls: ["stun:server2024.stunprotocol.org:3478"]},
		],
	},

	google: {
		iceServers: [
			{urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"]},
		],
	},

	mozilla: {
		iceServers: [
			{urls: ["stun:stun.services.mozilla.com:3478"]},
		],
	},

	stunprotocol: {
		iceServers: [
			{urls: ["stun:server2024.stunprotocol.org:3478"]},
		],
	},
} satisfies Record<string, RTCConfiguration>

export const stdRtcConfig = (): RTCConfiguration => rtcConfig.std

