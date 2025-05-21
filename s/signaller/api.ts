
import {ExposedError} from "renraku"

import {Core} from "./core.js"
import {Id} from "../tools/id.js"
import {Agent} from "./parts/agent.js"
import {Partner} from "../negotiation/types.js"
import {fetchCloudflareTurn} from "./parts/fetch-cloudflare-turn.js"
import {SignallerParams, SignallerStats, TurnResult} from "./types.js"
import {negotiate_rtc_connection} from "../negotiation/negotiate-rtc-connection.js"

export type SignallerApi = ReturnType<typeof makeSignallerApi>

export const makeSignallerApi = (
		core: Core,
		agent: Agent,
		params: SignallerParams,
		origin: string,
	) => ({v1: {

	async hello() {
		return agent.info()
	},

	async stats(): Promise<SignallerStats> {
		return core.statistician.stats()
	},

	async turn(): Promise<TurnResult> {
		if (!params.turn.cloudflare)
			return {no: "this sparrow server is not configured for turn"}
		if (!params.turn.allow.has(origin))
			return {no: `your origin is not allowed to use the turn server "${origin}"`}
		return {turn: await fetchCloudflareTurn(params.turn.cloudflare)}
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
		await agent.onIceCandidate.pub(ice)
	},
}})

