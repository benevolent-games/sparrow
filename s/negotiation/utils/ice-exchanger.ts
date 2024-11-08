
import {Partner} from "../types.js"

export class IceExchanger {
	auto = false
	disposers: (() => void)[] = []

	toAlice: RTCIceCandidate[] = []
	toBob: RTCIceCandidate[] = []

	constructor(
			public attemptId: string,
			public alice: Partner,
			public bob: Partner,
		) {

		this.disposers.push(
			alice.agent.onIceCandidate(async ice => {
				this.toBob.push(ice)
				if (this.auto)
					await this.send()
			})
		)

		this.disposers.push(
			bob.agent.onIceCandidate(async ice => {
				this.toAlice.push(ice)
				if (this.auto)
					await this.send()
			})
		)
	}

	async send() {
		const {attemptId, alice, bob, toAlice, toBob} = this
		this.toAlice = []
		this.toBob = []

		await Promise.all([
			Promise.all(
				toAlice.map(ice => alice.api.v1.acceptIceCandidate(attemptId, ice))
			),
			Promise.all(
				toBob.map(ice => bob.api.v1.acceptIceCandidate(attemptId, ice))
			),
		])
	}

	stop() {
		this.disposers.forEach(d => d())
	}
}

