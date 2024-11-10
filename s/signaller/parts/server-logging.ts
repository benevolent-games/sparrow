
import {color, loggers} from "renraku/x/server.js"

export function serverLogging(ip: string, emoji: string) {
	return {
		remote: loggers.label({
			remote: true,
			label: `${color.dim(ip)} ${emoji} <-`,
			prefix: "client",
		}),
		local: loggers.label({
			remote: false,
			label: `${color.dim(ip)} ${emoji} ->`,
			prefix: "server",
		}),
	}
}

