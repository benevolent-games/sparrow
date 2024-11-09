
import {ExposedError} from "renraku/x/server.js"
import {CloudflareTurnParams, TurnConfig} from "../types.js"

type CloudflareCreds = {
	iceServers: {
		urls: string[]
		username: string
		credential: string
	}
}

export async function fetchCloudflareTurn({token}: CloudflareTurnParams) {
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
	const turnConfig: TurnConfig = iceServers

	return turnConfig
}

