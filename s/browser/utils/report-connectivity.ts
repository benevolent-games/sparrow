
export type ConnectivityKind = "local" | "direct" | "relay"

export type ConnectivityReport = {
	bytesSent: number
	bytesReceived: number
	kind: ConnectivityKind
}

type CandidatePair = {
	id: string
	type: "candidate-pair"
	localCandidateId: string
	remoteCandidateId: string
	bytesSent: number
	bytesReceived: number
	nominated: boolean
	state: string
}

type Candidate = {
	id: string
	type: "local-candidate" | "remote-candidate"
	candidateType: "host" | "srflx" | "relay"
	address: string
	port: number
	protocol: string
}

async function collectRtcStats(peer: RTCPeerConnection) {
	const stats = await peer.getStats()
	const candidatePairs = new Map<string, CandidatePair>()
	const candidates = new Map<string, Candidate>()

	stats.forEach(stat => {
		switch (stat.type) {
			case "candidate-pair":
				return candidatePairs.set(stat.id, stat)

			case "local-candidate":
				return candidates.set(stat.id, stat)

			case "remote-candidate":
				return candidates.set(stat.id, stat)
		}
	})

	return {candidatePairs, candidates}
}

export async function reportConnectivity(peer: RTCPeerConnection) {
	const stats = await collectRtcStats(peer)

	const aggregate = {
		bytesSent: 0,
		bytesReceived: 0,
		srflx: false,
		relay: false,
	}

	const activeCandidates = new Set<Candidate>()

	for (const pair of stats.candidatePairs.values()) {
		if (pair.nominated !== true) continue
		aggregate.bytesSent += pair.bytesSent
		aggregate.bytesReceived += pair.bytesReceived
		const local = stats.candidates.get(pair.localCandidateId)
		const remote = stats.candidates.get(pair.remoteCandidateId)
		if (local) activeCandidates.add(local)
		if (remote) activeCandidates.add(remote)
	}

	for (const candidate of activeCandidates) {
		if (candidate.candidateType === "srflx")
			aggregate.srflx = true
		if (candidate.candidateType === "relay")
			aggregate.relay = true
	}

	const kind: ConnectivityKind = (
		aggregate.relay ?
			"relay" :
		aggregate.srflx ?
			"direct" :
			"local"
	)

	const report: ConnectivityReport = {
		kind,
		bytesSent: aggregate.bytesSent,
		bytesReceived: aggregate.bytesReceived,
	}

	return report
}

