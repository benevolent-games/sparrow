
import {renrakuApi, renrakuService} from "renraku"

import {generateRandomId} from "../../toolbox/generate-random-id.js"
import {extractSessionInfo} from "../cores/utils/extract-session-info.js"

import type {makeSessionManager} from "../cores/make-session-manager.js"

export const makeSignalServerApi = ({sessionProvider, sessionFinder, clientManager}: {
		sessionFinder: ReturnType<typeof makeSessionManager>["sessionFinder"]
		sessionProvider: ReturnType<ReturnType<typeof makeSessionManager>["makeSessionProvider"]>
		clientManager: ReturnType<ReturnType<typeof makeSessionManager>["makeClientManager"]>
	}) => renrakuApi({

	hosting: renrakuService()
		.policy(async() => {})
		.expose(() => ({
			establishSession: sessionProvider.establishSession,
			async submitIceCandidates(clientId: string, candidates: any[]) {
				const client = clientManager.getClient(clientId)!
				await client.handleIceCandidates(candidates)
			},
			terminateSession: sessionProvider.terminateSession,
		})),

	discovery: renrakuService()
		.policy(async() => {})
		.expose(() => ({
			async listSessions() {
				return []
			},
		})),

	connecting: renrakuService()
		.policy(async() => {})
		.expose(() => ({
			async joinSession(sessionId: string) {
				const session = sessionFinder.findSessionById(sessionId)
				if (session) {
					const host = sessionFinder.getSessionHost(session)!
					const clientId = generateRandomId()
					const accepted = await host.handleJoiner(clientId)
					if (accepted) {
						clientManager.addClient(clientId)
						return {
							clientId,
							offer: accepted.offer,
							sessionInfo: extractSessionInfo(session),
						}
					}
					else {
						return undefined
					}
				}
				else {
					throw new Error("session not found")
				}
			},
			async submitAnswer(sessionId: string, clientId: string, answer: any) {
				const session = sessionFinder.findSessionById(sessionId)
				if (session) {
					const host = sessionFinder.getSessionHost(session)!
					await host.handleAnswer(clientId, answer)
				}
				else {
					throw new Error("session not found")
				}
			},
			async submitIceCandidates(sessionId: string, clientId: string, candidates: any[]) {
				const host = sessionFinder.findHostBySessionId(sessionId)
				await host.handleIceCandidates(clientId, candidates)
			},
		})),
})
