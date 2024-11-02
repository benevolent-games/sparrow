
import {Core} from "./core.js"
import {Stats} from "./types.js"
import {Agent} from "./parts/agent.js"
import {hexId} from "../tools/hex-id.js"
import {Partner} from "../negotiation/types.js"
import {negotiate_rtc_connection} from "../negotiation/negotiate-rtc-connection.js"

export type SignalingApi = ReturnType<typeof makeSignalingApi>

export const makeSignalingApi = (core: Core, agent: Agent) => ({
	v0: {
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
			const host = core.agents.invites.require(invite)
			return host.info()
		},

		async join(invite: string) {
			try {
				const alice = core.agents.invites.require(invite)
				const bob = agent

				const allowed = await alice.browserApi.knock(bob.info())
				if (!allowed)
					return null

				const partnerA: Partner = {
					agent: alice,
					api: alice.browserApi.partner,
				}

				const partnerB: Partner = {
					agent: bob,
					api: bob.browserApi.partner,
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
	},
})

