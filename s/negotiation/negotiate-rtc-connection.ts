
import {Partner} from "./types.js"
import {deadline} from "@benev/slate"
import {generalTimeout} from "../browser/types.js"
import {attempt_rtc_connection} from "./utils/attempt-rtc-connection.js"
import {Id} from "../tools/id.js"

/**
 * the signaller server uses this algorithm to connect two webrtc browser peers.
 */
export async function negotiate_rtc_connection(
		alice: Partner,
		bob: Partner,
	) {

	async function cancel(error: any) {
		await deadline(generalTimeout, () => Promise.all([
			alice.api.v1.cancel(bob.agent.id),
			bob.api.v1.cancel(alice.agent.id),
		]))
		throw error
	}

	async function attempt(alice: Partner, bob: Partner) {
		const attemptId = Id.random()
		return deadline(generalTimeout, () => attempt_rtc_connection(
			attemptId,
			alice,
			bob,
		))
	}

	// try it this way
	return attempt(alice, bob)

		// try it that way
		.catch(() => attempt(bob, alice))

		// cancel on final error
		.catch(cancel)
}

