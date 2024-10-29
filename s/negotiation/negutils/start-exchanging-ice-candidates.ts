
import {Partner} from "../types.js"

/**
 * allow the browser peers to freely exchange ice canadidates with each other.
 */
export function start_exchanging_ice_candidates(
		[aliceId, alice]: [string, Partner],
		[bobId, bob]: [string, Partner],
	) {

	const stopA = alice.agent.onIceCandidate(ice => bob.api.acceptIceCandidate(bobId, ice))
	const stopB = bob.agent.onIceCandidate(ice => alice.api.acceptIceCandidate(aliceId, ice))

	return () => {
		stopA()
		stopB()
	}
}

