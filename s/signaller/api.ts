
import {hexId} from "@benev/slate"
import {ExposedError} from "renraku"

import {Core} from "./core.js"
import {Stats} from "./types.js"
import {Agent} from "./parts/agent.js"
import {Partner} from "../negotiation/types.js"
import {negotiate_rtc_connection} from "../negotiation/negotiate-rtc-connection.js"

export type SignallerApi = ReturnType<typeof makeSignallerApi>

export const makeSignallerApi = (core: Core, agent: Agent) => ({v1: {
	async hello() {
		return agent.info()
	},

	async stats(): Promise<Stats> {
		return core.statistician.stats()
	},

	async createInvite(): Promise<string> {
		const invite = hexId()
		agent.invites.add(invite)
		core.agents.invites.set(invite, agent)
		return invite
	},

	async deleteInvite(invite: string): Promise<void> {
		agent.invites.delete(invite)
		core.agents.invites.delete(invite)
	},

	async query(invite: string) {
		try {
			const host = core.agents.invites.require(invite)
			return host.info()
		}
		catch (error) {
			throw new ExposedError(`invite ${invite.slice(0, 5)} is no longer available`)
		}
	},

	async join(invite: string) {
		try {
			const alice = core.agents.invites.require(invite)
			const bob = agent

			const allowances = await Promise.all([
				alice.browserApi.v1.knock(bob.info()),
				bob.browserApi.v1.knock(alice.info()),
			])

			if (allowances.some(allowed => !allowed))
				return null

			const partnerA: Partner = {
				agent: alice,
				api: alice.browserApi,
			}

			const partnerB: Partner = {
				agent: bob,
				api: bob.browserApi,
			}

			await negotiate_rtc_connection(partnerA, partnerB)
			core.statistician.recordConnection()
			return alice.info()
		}
		catch (error) {
			core.statistician.recordFailure()
			throw error
		}
	},

	async sendIceCandidate(ice: RTCIceCandidate) {
		await agent.onIceCandidate.publish(ice)
	},
}})

