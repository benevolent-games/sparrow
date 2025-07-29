
import {Logger} from "@e280/sten"

const logger = new Logger()
const {colors} = logger

const log = (varname: string, value: string | undefined) => logger.log([
	colors.yellow(varname),
	value !== undefined
		? colors.green("set")
		: colors.magenta("unset"),
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

