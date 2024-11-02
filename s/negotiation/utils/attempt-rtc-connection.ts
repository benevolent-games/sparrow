
import {loggers} from "renraku"
import {Partner} from "../types.js"
import {IceExchanger} from "./ice-exchanger.js"

/**
 * we coordinate the peers to exchange offer, answer, and ice candidates.
 * we also wait to see if both peers say the connection was successful or not.
 */
export async function attempt_rtc_connection(offerer: Partner, answerer: Partner) {
	const offererId = offerer.agent.id
	const answererId = answerer.agent.id

	loggers.log(`${offerer.agent.id}`, "starting peer connections..")

	await Promise.all([
		offerer.api.startPeerConnection(answerer.agent.info()),
		answerer.api.startPeerConnection(offerer.agent.info()),
	])

	loggers.log(`${offerer.agent.id}`, "creating ice exchanger..")
	const iceExchanger = new IceExchanger(offerer, answerer)

	try {
		loggers.log(`${offerer.agent.id}`, "exchanging offer/answers..")
		const offer = await offerer.api.produceOffer(answererId)
		const answer = await answerer.api.produceAnswer(offererId, offer)
		await offerer.api.acceptAnswer(answererId, answer)

		loggers.log(`${offerer.agent.id}`, "initial ice send..")
		iceExchanger.auto = true
		await iceExchanger.send()

		loggers.log(`${offerer.agent.id}`, "waiting until ready..")
		await Promise.all([
			offerer.api.waitUntilReady(answererId),
			answerer.api.waitUntilReady(offererId),
		])
	}
	finally {
		loggers.log(`${offerer.agent.id}`, "stopping ice exchanger..")
		iceExchanger.stop()
	}
}

