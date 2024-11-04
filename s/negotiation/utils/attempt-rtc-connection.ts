
import {Partner} from "../types.js"
import {IceExchanger} from "./ice-exchanger.js"

/**
 * we coordinate the peers to exchange offer, answer, and ice candidates.
 * we also wait to see if both peers say the connection was successful or not.
 */
export async function attempt_rtc_connection(offerer: Partner, answerer: Partner) {
	const offererId = offerer.agent.id
	const answererId = answerer.agent.id

	await Promise.all([
		offerer.api.startPeerConnection(answerer.agent.info()),
		answerer.api.startPeerConnection(offerer.agent.info()),
	])

	const iceExchanger = new IceExchanger(offerer, answerer)

	try {
		const offer = await offerer.api.produceOffer(answererId)
		const answer = await answerer.api.produceAnswer(offererId, offer)
		await offerer.api.acceptAnswer(answererId, answer)

		iceExchanger.auto = true
		await iceExchanger.send()

		await Promise.all([
			offerer.api.waitUntilReady(answererId),
			answerer.api.waitUntilReady(offererId),
		])

		await Promise.all([
			offerer.api.completed(answererId),
			answerer.api.completed(offererId),
		])
	}
	finally {
		iceExchanger.stop()
	}
}

