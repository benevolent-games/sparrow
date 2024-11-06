
import {loggers} from "renraku"

export type Logging = ReturnType<typeof stdLogging>

export function stdLogging() {
	const emoji = "👤"
	return {
		remote: loggers.label({remote: true, label: `${emoji} ->`, prefix: "server"}),
		local: loggers.label({remote: false, label: `${emoji} <-`, prefix: "client"}),
	}
}

export function errorLogging() {
	const logging = stdLogging()
	logging.remote.onCall = () => {}
	logging.local.onCall = () => {}
	return logging
}

export function noLogging() {
	const logging = stdLogging()
	logging.remote.onCall = () => {}
	logging.remote.onCallError = () => {}
	logging.local.onCall = () => {}
	logging.local.onCallError = () => {}
	return logging
}

