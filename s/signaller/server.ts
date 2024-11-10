
import "@benev/slate/x/node.js"

import {Core} from "./core.js"
import {BrowserApi} from "../browser/api.js"
import {getSignallerParams} from "./params.js"
import {generalTimeout} from "../browser/types.js"
import {WebSocketServer, remote, endpoint, loggers, RandomUserEmojis, deathWithDignity} from "renraku/x/server.js"

deathWithDignity()

loggers.log("📜 environment variables:")
const params = getSignallerParams()

const core = new Core(params)
const emojis = new RandomUserEmojis()

const server = new WebSocketServer({
	timeout: generalTimeout,
	acceptConnection: async({ip, headers, remoteEndpoint, close}) => {
		const emoji = emojis.pull()
		const remoteLogging = loggers.label({remote: true, label: `${emoji} <-`, prefix: "client"})
		const localLogging = loggers.label({remote: false, label: `${emoji} ->`, prefix: "server"})

		if (!params.debug) {
			remoteLogging.onCall = () => {}
			localLogging.onCall = () => {}
		}

		const browserApi = remote<BrowserApi>(remoteEndpoint, remoteLogging)
		const {agent, signallerApi} = await core.acceptAgent(ip, headers, browserApi, close)
		return {
			closed: () => core.deleteAgent(agent),
			localEndpoint: endpoint(signallerApi, localLogging),
		}
	},
})

server.listen(
	params.port,
	() => loggers.log(`🚀 listening on ${params.port}`),
)

