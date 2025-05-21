
import "@benev/slate/x/node.js"

import {Core} from "./core.js"
import {BrowserApi} from "../browser/api.js"
import {getSignallerParams} from "./params.js"
import {generalTimeout} from "../browser/types.js"
import {serverLogging} from "./parts/server-logging.js"
import {ipToReputation} from "./parts/ip-to-reputation.js"
import {WebSocketServer, remote, endpoint, logger, RandomUserEmojis, deathWithDignity, Logcore} from "renraku/node"

deathWithDignity()

logger.logcore = new Logcore()
logger.logcore.log("📜 environment variables:")
const params = getSignallerParams()

const core = new Core(params)
const emojis = new RandomUserEmojis()

const server = new WebSocketServer({
	timeout: generalTimeout,
	acceptConnection: async({ip, headers, remoteEndpoint, close}) => {
		const reputation = await ipToReputation(ip, params.salt)
		const emoji = emojis.pull()
		const logging = serverLogging(reputation, emoji)

		if (!params.debug) {
			logging.remote.onCall = () => {}
			logging.local.onCall = () => {}
		}

		const browserApi = remote<BrowserApi>(remoteEndpoint, logging.remote)
		const {agent, signallerApi} = await core.acceptAgent(reputation, headers, browserApi, close)
		return {
			closed: () => core.deleteAgent(agent),
			localEndpoint: endpoint(signallerApi, logging.local),
		}
	},
})

server.listen(
	params.port,
	() => logger.logcore.log(`🚀 listening on ${params.port}`),
)

