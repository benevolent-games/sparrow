
export const customRtcConfig = (): RTCConfiguration => ({
	"iceServers": [{
		"urls": [
			"stun:stun.cloudflare.com:3478",
			"turn:turn.cloudflare.com:3478?transport=udp",
			"turn:turn.cloudflare.com:3478?transport=tcp",
			"turns:turn.cloudflare.com:5349?transport=tcp",
		],
		"username":"g01f61887a5c954b0421992d6a74f8328ab095946726088e3018787be35da76a",
		"credential":"3988c6fe102ae5b7d61bd73ec74661f67107a1db0518f8039a36a4be53235bf3"
	}],
})

