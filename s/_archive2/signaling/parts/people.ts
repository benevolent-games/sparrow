
import {Pool} from "../../tools/map2.js"
import {hexId} from "../../tools/hex-id.js"
import {pubsub} from "../../tools/pubsub.js"
import {BrowserApi} from "../../browser/api.js"

export class People extends Pool<Person> {}

export class Person {
	id = hexId()
	onIceCandidate = pubsub<[RTCIceCandidate]>()

	constructor(
		public name: string,
		public browserApi: BrowserApi,
		public disconnect: () => void,
	) {}

	info(): PersonInfo {
		return {
			id: this.id,
			name: this.name,
		}
	}
}

export type PersonInfo = {
	id: string
	name: string
}

