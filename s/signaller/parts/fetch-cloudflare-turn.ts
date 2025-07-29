
import {ExposedError} from "@e280/renraku"
import {CloudflareTurnParams, IceServer} from "../types.js"

type CloudflareCreds = {
	iceServers: {
		urls: string[]
		username: string
		credential: string
	}
}

// see https://developers.cloudflare.com/calls/turn/generate-credentials/

export async function fetchCloudflareTurn({token}: CloudflareTurnParams): Promise<IceServer> {
	const ttl = 60 * 5
	const url = `https://rtc.live.cloudflare.com/v1/turn/keys/${token.id}/credentials/generate`

	const response = await fetch(url, {
		method: "POST",
		body: JSON.stringify({ttl}),
		headers: {
			"Authorization": `Bearer ${token.secret}`,
			"Content-Type": "application/json",
		},
	})

	if (!response.ok)
		throw new ExposedError(`failed to fetch turn credentials: ${response.statusText}`)

	const {iceServers} = await response.json() as CloudflareCreds

	return {
		urls: ["turn:turn.cloudflare.com:3478?transport=udp"],
		username: iceServers.username,
		credential: iceServers.credential,
	}
}

