
import {ExposedError} from "renraku"

import {Core} from "./core.js"
import {Stats} from "./types.js"
import {version} from "../version.js"
import {Agent} from "./agent/agent.js"
import {Partner} from "../negotiation/types.js"
import {negotiate_rtc_connection} from "../negotiation/negotiate-rtc-connection.js"

export type SignalingApi = ReturnType<typeof makeSignalingApi>

export const makeSignalingApi = (core: Core, agent: Agent) => ({

	async hello(wantedVersion: number) {
		if (wantedVersion !== version)
			throw new ExposedError(`version error: signaling server is at v${version}, but the client wanted v${wantedVersion}`)
		return agent.confidential()
	},

	async stats(): Promise<Stats> {
		return core.statistician.stats()
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
})

