
import {loggers} from "renraku"

export function clientLogging(emoji: string) {
	return {
		remote: loggers.label({
			remote: true,
			label: `${emoji} ->`,
			prefix: "server",
		}),
		local: loggers.label({
			remote: false,
			label: `${emoji} <-`,
			prefix: "client",
		}),
	}
}

