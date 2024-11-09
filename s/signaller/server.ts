
import "@benev/slate/x/node.js"

import {Core} from "./core.js"
import {BrowserApi} from "../browser/api.js"
import {WebSocketServer, remote, endpoint, loggers, RandomUserEmojis, deathWithDignity} from "renraku/x/server.js"
import {generalTimeout} from "../browser/types.js"

deathWithDignity()

const port = process.argv[2]
	? parseInt(process.argv[2])
	: 8000

const debug = !!process.argv[3]

const salt = process.env["SPARROW_SALT"]

if (!salt)
	throw new Error("SPARROW_SALT env variable is missing")

const core = new Core(salt)
const emojis = new RandomUserEmojis()

const server = new WebSocketServer({
	timeout: generalTimeout,
	acceptConnection: async({ip, remoteEndpoint, close}) => {
		const emoji = emojis.pull()
		const remoteLogging = loggers.label({remote: true, label: `${emoji} <-`, prefix: "client"})
		const localLogging = loggers.label({remote: false, label: `${emoji} ->`, prefix: "server"})

		if (!debug) {
			remoteLogging.onCall = () => {}
			localLogging.onCall = () => {}
		}

		const browserApi = remote<BrowserApi>(remoteEndpoint, remoteLogging)
		const {agent, signallerApi} = await core.acceptAgent(ip, browserApi, close)
		return {
			closed: () => core.deleteAgent(agent),
			localEndpoint: endpoint(signallerApi, localLogging),
		}
	},
})

server.listen(port, () => loggers.log(`listening on ${port}`))

