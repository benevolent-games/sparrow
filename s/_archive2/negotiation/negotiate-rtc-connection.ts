
import {Partner} from "./types.js"
import {attempt_rtc_connection} from "./negutils/attempt-rtc-connection.js"

/**
 * the signaling server uses this algorithm to connect two webrtc browser peers.
 */
export async function negotiate_rtc_connection(
		host: Partner,
		client: Partner,
	) {

	return await (

		// try it this way: host as offerer
		attempt_rtc_connection(host, client)

			// try it that way: client as offerer
			.catch(() => attempt_rtc_connection(client, host))
	)
}

