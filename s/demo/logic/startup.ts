
import {signal} from "@benev/slate"

import {isLocal} from "../utils/is-local.js"
import {Sparrow} from "../../browser/sparrow.js"
import {StdDataCable} from "../../browser/types.js"
import {HostingSituation} from "./situations/hosting.js"
import {Prospect} from "../../browser/utils/prospect.js"
import {JoinerSituation} from "./situations/joiner.js"

export async function startup(closed: () => void) {
	const invite = Sparrow.parseInvite(location.hash)
	const url = isLocal()
		? `ws://${location.hostname}:8000/`
		: Sparrow.stdUrl()
	return invite
		? startJoiner(url, invite, closed)
		: startHosting(url, closed)
}

async function startHosting(url: string, closed: () => void) {
	const prospects = signal(new Set<Prospect<StdDataCable>>())

	const hosted = await Sparrow.host<StdDataCable>({
		url,
		allow: async() => true,
		closed: () => {
			hosting.closed()
			closed()
		},

		// new person is attempting to connect
		connecting: prospect => {
			prospects.value.add(prospect)
			prospects.publish()
			prospect.iceReport.onChange(() => prospects.publish())

			// connection is successful
			return () => {
				prospects.publish()

				// person has disconnected
				return () => {
					prospects.value.delete(prospect)
					prospects.publish()
				}
			}
		},
	})

	const stats = signal(await hosted.getStats())
	const hosting = new HostingSituation(hosted, prospects, stats)
	return hosting
}

async function startJoiner(url: string, invite: string, disconnected: () => void) {
	const joined = await Sparrow.join<StdDataCable>({
		url,
		invite,
		disconnected,
	})
	return new JoinerSituation(joined)
}

