
import {Pubsub, pubsub} from "@benev/slate"

import {host} from "../../../browser/host.js"
import {AgentInfo} from "../../../signaling/types.js"
import {Prospect} from "../../../browser/utils/prospect.js"

export type Lobby = {
	hostId: string
	people: Person[]
}

export type Person = {
	connected: boolean
	agent: AgentInfo
	iceCounts: {
		hostSide: number
		remoteSide: number
	}
}

export class HostLobby<Cable> {
	constructor(
		public prospects: Set<Prospect<Cable>>,
		public onChange: Pubsub,
		public self: AgentInfo,
		public invite: string,
		public close: () => void,
	) {}

	static async establish<Cable>(url: string, closed: () => void) {
		const prospects = new Set<Prospect<Cable>>()
		const onChange = pubsub()

		const {self, invite, close} = await host<Cable>({
			url,
			closed,
			allow: async() => true,
			connecting: prospect => {
				prospects.add(prospect)
				onChange.publish()
				prospect.iceReport.onChange(() => onChange.publish())

				return () => {
					onChange.publish()

					return () => {
						prospects.delete(prospect)
						onChange.publish()
					}
				}
			},
		})

		return new this(prospects, onChange, self, invite, close)
	}

	toLobby(): Lobby {
		return {
			hostId: this.self.id,
			people: [...this.prospects].map(({agent, iceReport, connection}) => ({
				agent,
				connected: !!connection,
				iceCounts: {
					hostSide: iceReport.locals.length,
					remoteSide: iceReport.remotes.length,
				},
			})),
		}
	}
}

