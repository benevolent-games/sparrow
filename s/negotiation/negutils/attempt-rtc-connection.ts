
import {Partner} from "../types.js"
import {start_exchanging_ice_candidates} from "./start-exchanging-ice-candidates.js"

/**
 * we coordinate the peers to exchange offer, answer, and ice candidates.
 * we also wait to see if both peers say the connection was successful or not.
 */
export async function attempt_rtc_connection(offerer: Partner, answerer: Partner) {
	const [offerId, answerId] = await Promise.all([
		offerer.api.startPeerConnection(answerer.agent.info()),
		answerer.api.startPeerConnection(offerer.agent.info()),
	])

	const stopExchanging = start_exchanging_ice_candidates(
		[offerId, offerer],
		[answerId, answerer],
	)

	try {
		const offer = await offerer.api.produceOffer(offerId)
		const answer = await answerer.api.produceAnswer(answerId, offer)
		await offerer.api.acceptAnswer(offerId, answer)
		await Promise.all([
			offerer.api.waitUntilReady(offerId),
			answerer.api.waitUntilReady(answerId),
		])
	}
	finally {
		stopExchanging()
	}
}

