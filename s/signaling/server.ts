
import {Core} from "./core.js"
import {BrowserApi} from "../browser/api.js"
import {deathWithDignity} from "../tools/death-with-dignity.js"
import {WebSocketServer, remote, endpoint} from "renraku/x/node.js"

deathWithDignity()

const port = process.argv[2]
	? parseInt(process.argv[2])
	: 8192

const core = new Core()

const server = new WebSocketServer({
	acceptConnection: async({ip, remoteEndpoint, close}) => {
		const browserApi = remote<BrowserApi>(remoteEndpoint)
		const {agent, signalingApi} = await core.acceptAgent(ip, browserApi, close)
		return {
			closed: () => core.agentDisconnected(agent),
			localEndpoint: endpoint(signalingApi),
		}
	},
})

server.listen(port)

