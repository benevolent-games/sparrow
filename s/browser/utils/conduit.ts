
import {DataChanneler} from "./data-channeler.js"

export class Conduit {
	static label = "sparrow_conduit"

	static async offering(peer: RTCPeerConnection) {
		return await DataChanneler.offering(peer, this.label, {ordered: true})
	}

	static async answering(peer: RTCPeerConnection) {
		return await DataChanneler.answering(peer, this.label)
	}
}

