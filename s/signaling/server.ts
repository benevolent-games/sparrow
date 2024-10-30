
import {Core} from "./core.js"
import {BrowserApi} from "../browser/api.js"
import {deathWithDignity} from "../tools/death-with-dignity.js"
import {WebSocketServer, remote, endpoint, PrettyLogger} from "renraku/x/node.js"

deathWithDignity()

const port = process.argv[2]
	? parseInt(process.argv[2])
	: 8000

const salt = process.env["SPARROW_SALT"]

if (!salt)
	throw new Error("SPARROW_SALT env variable is missing")

const core = new Core(salt)
const logger = new PrettyLogger()

logger.log("yoyo3")

const server = new WebSocketServer({
	acceptConnection: async({ip, remoteEndpoint, close}) => {
		const browserApi = remote<BrowserApi>(remoteEndpoint)
		const {agent, signalingApi} = await core.acceptAgent(ip, browserApi, close)
		return {
			closed: () => core.agentDisconnected(agent),
			localEndpoint: endpoint(signalingApi, {
				onError: (error, id, method) => logger.error(error),
			}),
		}
	},
	onError: error => logger.error(
		"",
		(error instanceof Error)
			? error.message
			: "unknown error"
	),
})

server.listen(port)

