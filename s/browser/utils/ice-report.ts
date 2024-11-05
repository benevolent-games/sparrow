
import {pubsub} from "@benev/slate"

export class IceReport {
	onChange = pubsub()

	locals: RTCIceCandidate[] = []
	remotes: RTCIceCandidate[] = []

	recordLocal(ice: RTCIceCandidate) {
		this.locals.push(ice)
		this.onChange.publish()
	}

	recordRemote(ice: RTCIceCandidate) {
		this.remotes.push(ice)
		this.onChange.publish()
	}
}

