
import {DataChanneller} from "./data-channeller.js"

export class Conduit {
	static label = "sparrow_conduit"

	static async offering(peer: RTCPeerConnection) {
		return await DataChanneller.offering(peer, this.label, {ordered: true})
	}

	static async answering(peer: RTCPeerConnection) {
		return await DataChanneller.answering(peer, this.label)
	}
}

