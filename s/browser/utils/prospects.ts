
import {Pool} from "@benev/slate"
import {Prospect} from "./prospect.js"
import {ConnectingFn, ProspectOptions} from "../types.js"

export class Prospects<Cable> extends Pool<Prospect<Cable>> {
	constructor(private connecting: ConnectingFn<Cable>) {
		super()
	}

	create(options: ProspectOptions) {
		if (this.has(options.agent.id))
			throw new Error("already engaged with this agent")

		// create the new prospect
		console.log("PROSPECT: CREATE")
		const prospect = new Prospect<Cable>(options)
		this.add(prospect)
		const connected = this.connecting(prospect)

		// remove the prospect when it dies
		prospect.onDisconnected(() => {
			console.log("PROSPECT: ON DISCONNECTED")
			this.remove(prospect)
		})

		// wiring up the prospect to the provided connected fn
		prospect.readyPromise.then(connection => {
			console.log("PROSPECT: CONNECTED")
			const disconnected = connected(connection)

			connection.onDisconnected(() => {
				console.log("CONNECTION: DISCONNECTED")
				disconnected()
			})
		})

		return prospect
	}

	disconnectEverybody() {
		for (const prospect of this.values()) {
			if (prospect.connection)
				prospect.connection.disconnect()
		}
	}

	async attempt<R>(id: string, fn: (prospect: Prospect<Cable>) => Promise<R>) {
		const connection = this.require(id)
		return await connection.handleFailure(async() => await fn(connection))
	}
}

