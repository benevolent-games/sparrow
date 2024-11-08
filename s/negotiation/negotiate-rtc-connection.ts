
import {Partner} from "./types.js"
import {deadline} from "@benev/slate"
import {attempt_rtc_connection} from "./utils/attempt-rtc-connection.js"

/**
 * the signaller server uses this algorithm to connect two webrtc browser peers.
 */
export async function negotiate_rtc_connection(
		alice: Partner,
		bob: Partner,
	) {

	const t = 10_000

	async function cancel(error: any) {
		await deadline(t, () => Promise.all([
			alice.api.v1.cancel(bob.agent.id),
			bob.api.v1.cancel(alice.agent.id),
		]))
		throw error
	}

	return await (

		// try it this way
		deadline(t, () => attempt_rtc_connection(alice, bob))

			// try it that way
			.catch(() => deadline(t, () => attempt_rtc_connection(bob, alice)))

			// cancel on final error
			.catch(cancel)
	)
}

