
import {logger} from "renraku"
import {color} from "@e280/science"

export function serverLogging(reputation: string, emoji: string) {
	return {
		remote: logger.logtool.label({
			remote: true,
			label: `${color.dim(reputation)} ${emoji} <-`,
			prefix: "client",
		}),
		local: logger.logtool.label({
			remote: false,
			label: `${color.dim(reputation)} ${emoji} ->`,
			prefix: "server",
		}),
	}
}

