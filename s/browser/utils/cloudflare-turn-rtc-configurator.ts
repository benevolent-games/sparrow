
import {RtcConfigurator} from "../types.js"

// see https://developers.cloudflare.com/calls/turn/generate-credentials/

export const cloudflareRtcConfigurator: RtcConfigurator = async({signaller}) => {
	const cloudflare = await signaller.turn.cloudflare()
	return {
		iceServers: [
			{urls: ["stun:stun.l.google.com:19302"]},
			{urls: ["stun:stun.services.mozilla.com:3478"]},
			{
				urls: ["turn:turn.cloudflare.com:3478?transport=udp"],
				username: cloudflare.username,
				credential: cloudflare.credential,
			},
		],
	}
}

