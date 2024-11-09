
import {color, loggers} from "renraku/x/server.js"

const log = (varname: string, value: string | undefined) => loggers.log([
	color.yellow(varname),
	value !== undefined
		? color.green("set")
		: color.magenta("unset"),
].join(" "))

export const Env = {
	option(varname: string) {
		const value = process.env[varname]
		log(varname, value)
		return value
	},
	require(varname: string) {
		const value = process.env[varname]
		if (value === undefined)
			throw new Error(`missing required environment variable "${varname}"`)
		log(varname, value)
		return value
	},
}

