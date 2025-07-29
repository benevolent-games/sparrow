
import Renraku from "@e280/renraku"
import {deathWithDignity} from "@benev/argv"

import {Core} from "./core.js"
import {BrowserApi} from "../browser/api.js"
import {getSignallerParams} from "./params.js"
import {generalTimeout} from "../browser/types.js"
import {ipToReputation} from "./parts/ip-to-reputation.js"

deathWithDignity()

const logger = new Renraku.LoggerTap()
logger.log("📜 environment variables:")

const params = getSignallerParams()
const core = new Core(params)

const server = new Renraku.Server({
	tap: logger,
	cors: {origins: "*"},
	timeout: generalTimeout,
	websocket: Renraku.websocket<BrowserApi>(async connection => {
		const headers = Renraku.simplifyHeaders(connection.request.headers)
		const reputation = await ipToReputation(connection.ip, params.salt)
		const {agent, signallerApi} = await core.acceptAgent(
			reputation,
			headers,
			connection.remote,
			connection.close,
		)
		return {
			rpc: () => signallerApi,
			disconnected: () => core.deleteAgent(agent),
		}
	}),
})

await server.listen(params.port)
await logger.log(`🚀 sparrow signaller :${params.port}`)

