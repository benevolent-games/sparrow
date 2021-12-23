
import {ClientState} from "../types.js"
import {queue} from "../toolbox/queue.js"
import {simplestate} from "../toolbox/simplestate.js"
import {connectToSignalServer} from "./utils/connect-to-signal-server.js"

export async function client({
		signalServerUrl,
		sessionId,
		rtcConfig,
		onJoined,
		onStateChange,
	}: {
		signalServerUrl: string
		sessionId: string
		rtcConfig: RTCConfiguration
		onStateChange(state: ClientState): void
		onJoined({}: {
			send(data: any): void
		}): {
			onClose(): void
			onMessage(data: any): void
		}
	}) {

	const peer = new RTCPeerConnection(rtcConfig)

	const simple = simplestate<ClientState>({
		state: {
			clientId: undefined,
			sessionInfo: undefined,
		},
		render: onStateChange,
	})

	const connection = await connectToSignalServer({
		url: signalServerUrl,
		client: {
			async handleIceCandidates(candidates) {
				console.log("handle ice candidates", candidates)
				for (const candidate of candidates)
					await peer.addIceCandidate(candidate)
				console.log("ice candidates added")
			},
		},
	})

	const iceQueue = queue(
		async(candidates: any[]) => await connection.signalServer.connecting
			.submitIceCandidates(sessionId, simple.state.clientId!, candidates)
	)

	let onClose = () => {}
	let onMessage = (message: any) => {}

	peer.onicecandidate = event => {
		const candidate = event.candidate
		if (candidate) {
			console.log("ICE CANDIDATE", candidate)
			iceQueue.add(candidate)
		}
	}

	peer.ondatachannel = event => {
		const channel = event.channel
		console.log("RECEIVED DATA CHANNEL", channel)
		channel.onopen = () => {
			console.log("data channel open")
			const controls = onJoined({
				send(data: any) {
					channel.send(JSON.stringify(data))
				},
			})
			onClose = controls.onClose
			onMessage = controls.onMessage
		}
		channel.onclose = () => {
			console.log("data channel closed")
			onClose()
		}
		channel.onmessage = event => {
			onMessage(JSON.parse(event.data))
		}
	}

	const joined = await connection.signalServer.connecting.joinSession(sessionId)
	if (joined) {
		simple.state = {
			clientId: joined.clientId,
			sessionInfo: joined.sessionInfo,
		}
		console.log("offer", joined.offer)
		await peer.setRemoteDescription(joined.offer)
		const answer = await peer.createAnswer()
		console.log("create answer", answer)
		await peer.setLocalDescription(new RTCSessionDescription(answer))
		const {clientId, sessionInfo} = joined
		await connection.signalServer.connecting.submitAnswer(sessionInfo.id, clientId, answer)
		console.log("submitted answer")
		await iceQueue.ready()
	}
	else throw new Error("failed to join")

	return {
		getState() {
			return simple.state
		},
	}
}
