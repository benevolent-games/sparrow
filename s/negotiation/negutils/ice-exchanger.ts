
import {Partner} from "../types.js"

export class IceExchanger {
	auto = false
	disposers: (() => void)[] = []

	toAlice: RTCIceCandidate[] = []
	toBob: RTCIceCandidate[] = []

	constructor(
			public alice: Partner,
			public bob: Partner,
		) {

		this.disposers.push(
			alice.agent.onIceCandidate(ice => {
				this.toBob.push(ice)
				if (this.auto)
					this.send()
			})
		)

		this.disposers.push(
			bob.agent.onIceCandidate(ice => {
				this.toAlice.push(ice)
				if (this.auto)
					this.send()
			})
		)
	}

	async send() {
		const {alice, bob, toAlice, toBob} = this
		this.toAlice = []
		this.toBob = []

		await Promise.all([
			Promise.all(
				toAlice.map(ice => alice.api.acceptIceCandidate(bob.agent.id, ice))
			),
			Promise.all(
				toBob.map(ice => bob.api.acceptIceCandidate(alice.agent.id, ice))
			),
		])
	}

	stop() {
		this.disposers.forEach(d => d())
	}
}

