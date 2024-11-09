
import {Partner} from "../types.js"
import {IceExchanger} from "./ice-exchanger.js"

/**
 * we coordinate the peers to exchange offer, answer, and ice candidates.
 * we also wait to see if both peers say the connection was successful or not.
 */
export async function attempt_rtc_connection(attemptId: string, alice: Partner, bob: Partner) {
	await Promise.all([
		alice.api.v1.startPeerConnection(attemptId, bob.agent.info()),
		bob.api.v1.startPeerConnection(attemptId, alice.agent.info()),
	])

	const iceExchanger = new IceExchanger(attemptId, alice, bob)

	try {
		const offer = await alice.api.v1.produceOffer(attemptId)
		const answer = await bob.api.v1.produceAnswer(attemptId, offer)
		await alice.api.v1.acceptAnswer(attemptId, answer)

		iceExchanger.auto = true
		await iceExchanger.send()

		await Promise.all([
			alice.api.v1.waitUntilReady(attemptId),
			bob.api.v1.waitUntilReady(attemptId),
		])

		await Promise.all([
			alice.api.v1.completed(attemptId),
			bob.api.v1.completed(attemptId),
		])
	}
	finally {
		iceExchanger.stop()
	}
}

