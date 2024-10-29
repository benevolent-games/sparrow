
import {Core} from "./core.js"
import {makeSignalingApi} from "./api.js"
import {BrowserApi} from "../browser/api.js"
import {deathWithDignity} from "../tools/death-with-dignity.js"
import {WebSocketServer, remote, expose} from "renraku/x/node.js"

deathWithDignity()

const port = process.argv[2]
	? parseInt(process.argv[2])
	: 8192

const core = new Core()

const server = new WebSocketServer({
	acceptConnection: ({remoteEndpoint, close}) => {
		const browserApi = remote<BrowserApi>(remoteEndpoint)
		const person = core.acceptNewPerson(browserApi, close)
		return {
			closed: () => core.personDisconnected(person),
			localEndpoint: expose(() => makeSignalingApi(core, person)),
		}
	},
})

server.listen(port)

