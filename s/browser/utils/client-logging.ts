
import {logger} from "renraku"

export function clientLogging(emoji: string) {
	return {
		remote: logger.logtool.label({
			remote: true,
			label: `${emoji} ->`,
			prefix: "server",
		}),
		local: logger.logtool.label({
			remote: false,
			label: `${emoji} <-`,
			prefix: "client",
		}),
	}
}

