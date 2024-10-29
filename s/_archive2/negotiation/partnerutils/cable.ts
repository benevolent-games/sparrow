
import {ConnectionReport} from "./connection-report.js"
import {PersonInfo} from "../../signaling/parts/people.js"

export class Cable<Channels> {

	/** this is the id of the person this cable is connected to */
	readonly id: string

	constructor(
			public person: PersonInfo,
			public channels: Channels,
			public peer: RTCPeerConnection,
			public report: ConnectionReport,
		) {
		this.id = person.id
	}
}

