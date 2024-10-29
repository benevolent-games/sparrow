
import {pubsub} from "@benev/slate"

import {Connected} from "./connected.js"
import {Pool} from "../../tools/map2.js"
import {Connection} from "./connection.js"
import {ConnectionOptions} from "../types.js"

export class Connections<Channels> extends Pool<Connection<Channels>> {
	onOperationAdded = pubsub<[Connection<Channels>]>()
	onOperationRemoved = pubsub<[Connection<Channels>]>()
	onConnected = pubsub<[Connected<Channels>]>()

	onChange = pubsub()

	constructor() {
		super()

		// publish onChange when any event happens
		const change = () => this.onChange.publish()
		this.onOperationAdded(change)
		this.onOperationRemoved(change)
		this.onConnected(change)
	}

	create(options: ConnectionOptions) {
		if (this.has(options.agent.id))
			throw new Error("already engaged with this agent")

		const operation = new Connection<Channels>(options)
		this.add(operation)
		this.onOperationAdded.publish(operation)

		const remove = () => {
			this.remove(operation)
			this.onOperationRemoved.publish(operation)
		}

		// remove the operation when it dies
		operation.onDead(remove)

		// publish onConnected when connection is complete
		operation.connectedPromise.then(connected => this.onConnected.publish(connected))

		return operation
	}

	async attempt<R>(id: string, fn: (operation: Connection<Channels>) => Promise<R>) {
		const operation = this.require(id)
		return await operation.handleFailure(async() => await fn(operation))
	}
}

