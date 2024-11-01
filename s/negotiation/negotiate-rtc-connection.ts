
import {Partner} from "./types.js"
import {attempt_rtc_connection} from "./negutils/attempt-rtc-connection.js"

/**
 * the signaling server uses this algorithm to connect two webrtc browser peers.
 */
export async function negotiate_rtc_connection(
		alice: Partner,
		bob: Partner,
	) {

	return await (

		// try it this way
		attempt_rtc_connection(alice, bob)

			// try it that way
			.catch(() => attempt_rtc_connection(bob, alice))
	)
}

