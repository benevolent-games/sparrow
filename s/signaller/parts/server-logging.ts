
import {color, loggers} from "renraku/x/server.js"

export function serverLogging(reputation: string, emoji: string) {
	return {
		remote: loggers.label({
			remote: true,
			label: `${color.dim(reputation)} ${emoji} <-`,
			prefix: "client",
		}),
		local: loggers.label({
			remote: false,
			label: `${color.dim(reputation)} ${emoji} ->`,
			prefix: "server",
		}),
	}
}

