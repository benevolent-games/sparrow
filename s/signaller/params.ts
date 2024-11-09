
import {Env} from "./parts/env.js"
import {SignallerParams} from "./types.js"

export function getSignallerParams(): SignallerParams {
	return {
		port: parseInt(Env.require("SPARROW_PORT")),
		salt: Env.require("SPARROW_SALT"),
		debug: (Env.require("SPARROW_DEBUG")).toLowerCase() === "true",

		turn: {
			allow: new Set<string>(
				Env.require("SPARROW_TURN_ALLOW")
					.split(",")
			),

			cloudflare: (() => {
				const id = Env.option("SPARROW_TURN_CLOUDFLARE_ID")
				const secret = Env.option("SPARROW_TURN_CLOUDFLARE_SECRET")
				return (id && secret)
					? {token: {id, secret}}
					: undefined
			})(),
		},
	}
}

