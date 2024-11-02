
import {ConnectOptions} from "./types.js"
import {stdOptions} from "./std/options.js"
import {makeBrowserApi} from "../browser/api.js"
import {SignalingApi} from "../signaling/api.js"
import {CableConfig} from "../negotiation/types.js"
import {endpoint, loggers, webSocketRemote} from "renraku"

export async function connect<Cable>(options: ConnectOptions<Cable>) {
	const o = {...stdOptions(), ...options}

	const emoji = "👤"
	const remoteLogging = loggers.label({remote: true, label: `${emoji} ->`, prefix: "server"})
	const localLogging = loggers.label({remote: false, label: `${emoji} <-`, prefix: "client"})

	let selfId: string | undefined

	const {socket, fns: signalingApi} = await webSocketRemote<SignalingApi>({
		...remoteLogging,
		url: o.url,
		onClose: o.closed,
		getLocalEndpoint: signalingApi => endpoint(
			makeBrowserApi({
				allow: async agent => !!(
					agent.id !== selfId &&
					await o.allow(agent)
				),
				partner: {
					signalingApi,
					rtcConfig: o.rtcConfig,
					cableConfig: o.cableConfig as CableConfig<Cable>,
				},
			}),
			localLogging,
		),
	})

	const signaller = signalingApi.v0 as SignalingApi["v0"]
	const self = await signaller.hello()
	const close = () => socket.close()
	return {self, signaller, close}
}

