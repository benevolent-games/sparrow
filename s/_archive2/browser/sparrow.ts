
import {stdUrl} from "./std/url.js"
import {Cables} from "./parts/cables.js"
import {connect} from "./std/connect.js"
import {Pubsub} from "../tools/pubsub.js"
import {HostRoom} from "./parts/host-room.js"
import {stdRtcConfig} from "./std/rtc-config.js"
import {ClientRoom} from "./parts/client-room.js"
import {stdOptions} from "./std/connect-options.js"
import {DoorPolicies} from "./parts/door-policies.js"
import {allowEveryone} from "./std/allow-everyone.js"
import {attachEvents} from "../tools/attach-events.js"
import {stdDataChannels} from "./std/data-channels.js"
import {PersonInfo} from "../signaling/parts/people.js"
import {SignalingApi, Stats} from "../signaling/api.js"
import {StdDataChannels} from "../negotiation/types.js"
import {Cable} from "../negotiation/partnerutils/cable.js"
import {HostingOptions} from "../signaling/parts/rooms.js"
import {ConnectionReport} from "../negotiation/partnerutils/connection-report.js"

export class Sparrow<Channels> {
	static stdOptions = stdOptions

	static stdUrl = stdUrl
	static stdRtcConfig = stdRtcConfig
	static stdDataChannels = stdDataChannels

	static connect = connect
	static allowEveryone = allowEveryone

	cables = new Cables<Channels>()

	ping?: number
	stats?: Stats
	#pingTimeout?: any

	constructor(
			public socket: WebSocket,
			public signalingApi: SignalingApi,
			public self: PersonInfo,
			public doorPolicies: DoorPolicies,
			public onCable: Pubsub<[Cable<Channels>]>,
			public onReport: Pubsub<[ConnectionReport]>,
		) {

		const cleanup = () => this.#cleanup()

		attachEvents(socket, {
			error: cleanup,
			close: cleanup,
		})
	}

	async getStats() {
		return this.signalingApi.basic.stats()
	}

	async host(options: HostingOptions) {
		this.#requireConnectionToSignalingServer()
		const room = await this.signalingApi.rooms.host({
			label: options.label,
			discoverable: options.discoverable,
		})
		return new HostRoom(this, room)
	}

	async join(roomId: string) {
		this.#requireConnectionToSignalingServer()
		const room = await this.signalingApi.rooms.join(roomId)
		if (room) {
			const host = room.participants.find(p => p.id === room.hostId)!
			return room && new ClientRoom(this, room, host)
		}
	}

	#cleanup() {
		this.#stopPinging()
	}

	disconnect() {
		this.#cleanup()
		this.socket.close()
	}

	#startPinging() {
		this.#pingTimeout = setTimeout(async() => {
			const before = Date.now()
			this.stats = await this.getStats()
			this.ping = Date.now() - before
			this.#startPinging()
		}, 3000)
	}

	#stopPinging() {
		if (this.#pingTimeout)
			clearTimeout(this.#pingTimeout)
		this.#pingTimeout = undefined
	}

	#requireConnectionToSignalingServer() {
		if (this.socket.readyState !== this.socket.OPEN)
			throw new Error("socket is disconnected, cannot continue")
	}
}

