
import {Map2, pubsub} from "@benev/slate"
import {Cable} from "../../negotiation/partnerutils/cable.js"
import {Operation} from "../../negotiation/partnerutils/operations.js"

type AgentId = string

export class Goose<Channels> {
	operations = new Map2<AgentId, Operation<Channels>>()

	onOperationAdded = pubsub<[Operation<Channels>]>()
	onOperationRemoved = pubsub<[Operation<Channels>]>()
	onCable = pubsub<[Cable<Channels>]>()
	onChange = pubsub()

	constructor() {
		const change = () => this.onChange.publish()
		this.onOperationAdded(change)
		this.onOperationRemoved(change)
		this.onCable(change)
	}

	addOperation(operation: Operation<Channels>) {
		this.operations.set(operation.agent.id, operation)
		this.onOperationAdded.publish(operation)
		const remove = () => this.removeOperation(operation)

		operation.cablePromise
			.then(cable => {
				this.onCable.publish(cable)
				cable.onClosed(remove)
			})
			.catch(error => {
				remove()
				throw error
			})

		operation.onDead(remove)
	}

	removeOperation(operation: Operation<Channels>) {
		this.operations.delete(operation.agent.id)
		this.onOperationRemoved.publish(operation)
	}
}

