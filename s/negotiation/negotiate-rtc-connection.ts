
import {Partner} from "./types.js"
import {deadline} from "@benev/slate"
import {generalTimeout} from "../browser/types.js"
import {attempt_rtc_connection} from "./utils/attempt-rtc-connection.js"

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

	return await (

		// try it this way
		deadline(generalTimeout, () => attempt_rtc_connection(alice, bob))

			// try it that way
			.catch(() => deadline(generalTimeout, () => attempt_rtc_connection(bob, alice)))

			// cancel on final error
			.catch(cancel)
	)
}

