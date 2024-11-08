
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

	return await (

		// try it this way
		deadline(10_000, () => attempt_rtc_connection(alice, bob))

			// try it that way
			.catch(() =>
				deadline(10_000, () => attempt_rtc_connection(bob, alice))
			)
	)
}

