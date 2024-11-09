
import {ExposedError} from "renraku"

import {Core} from "./core.js"
import {Id} from "../tools/id.js"
import {Agent} from "./parts/agent.js"
import {Partner} from "../negotiation/types.js"
import {SignallerParams, Stats} from "./types.js"
import {fetchCloudflareTurn} from "./parts/fetch-cloudflare-turn.js"
import {negotiate_rtc_connection} from "../negotiation/negotiate-rtc-connection.js"

export type SignallerApi = ReturnType<typeof makeSignallerApi>

export const makeSignallerApi = (
		core: Core,
		agent: Agent,
		params: SignallerParams,
		origin: string | undefined,
	) => ({v1: {

	async hello() {
		return agent.info()
	},

	async stats(): Promise<Stats> {
		return core.statistician.stats()
	},

	async turnCloudflare() {
		if (!params.turn.cloudflare)
			throw new ExposedError("this server is not configured for cloudflare")
		if (!origin)
			throw new ExposedError("request origin header is mysteriously missing")
		if (!params.turn.allow.has(origin))
			throw new ExposedError(`origin "${origin}" is not configured to be allowed to use the turn server`)
		return fetchCloudflareTurn(params.turn.cloudflare)
	},

	async createInvite(): Promise<string> {
		const invite = Id.random()
		if (core.invites.has(invite))
			throw new Error("invite collision")
		agent.invites.add(invite)
		core.invites.set(invite, agent)
		return invite
	},

	async deleteInvite(invite: string): Promise<void> {
		agent.invites.delete(invite)
		core.invites.delete(invite)
	},

	async query(invite: string) {
		try {
			const host = core.invites.require(invite)
			return host.info()
		}
		catch (error) {
			throw new ExposedError(`invite ${invite.slice(0, 5)} is no longer available`)
		}
	},

	async join(invite: string) {
		try {
			const alice = core.invites.require(invite)
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

