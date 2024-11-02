
export const stdRtcConfig = (): RTCConfiguration => ({
	iceServers: [
		{
			urls: [
				"stun:server2024.stunprotocol.org:3478",

				// "stun:stun.l.google.com:19302",
				// "stun:stun1.l.google.com:19302",
				// "stun:stun2.l.google.com:19302",
				// "stun:stun3.l.google.com:19302",
				// "stun:stun4.l.google.com:19302",
			]
		},
	]
})

