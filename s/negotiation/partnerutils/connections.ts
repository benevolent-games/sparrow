
import {pubsub} from "@benev/slate"

import {Connected} from "./connected.js"
import {Pool} from "../../tools/map2.js"
import {Connection} from "./connection.js"
import {ConnectionOptions} from "../types.js"

export class Connections<Cable> extends Pool<Connection<Cable>> {
	onConnectionAdded = pubsub<[Connection<Cable>]>()
	onConnectionRemoved = pubsub<[Connection<Cable>]>()
	onConnected = pubsub<[Connected<Cable>]>()

	onChange = pubsub()

	constructor() {
		super()

		// publish onChange when any event happens
		const change = () => this.onChange.publish()
		this.onConnectionAdded(change)
		this.onConnectionRemoved(change)
		this.onConnected(change)
	}

	create(options: ConnectionOptions) {
		if (this.has(options.agent.id))
			throw new Error("already engaged with this agent")

		const connection = new Connection<Cable>(options)
		this.add(connection)
		this.onConnectionAdded.publish(connection)

		const remove = () => {
			this.remove(connection)
			this.onConnectionRemoved.publish(connection)
		}

		// remove the connection when it dies
		connection.onDead(remove)

		// publish onConnected when connection is complete
		connection.connectedPromise.then(connected => this.onConnected.publish(connected))

		return connection
	}

	async attempt<R>(id: string, fn: (connection: Connection<Cable>) => Promise<R>) {
		const connection = this.require(id)
		return await connection.handleFailure(async() => await fn(connection))
	}
}

