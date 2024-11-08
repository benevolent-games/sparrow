
import {isLocal} from "../utils/is-local.js"
import {Sparrow} from "../../browser/sparrow.js"
import {JoinerSituation} from "./situations/joiner.js"
import {HostingSituation} from "./situations/hosting.js"
import {Id} from "../../tools/id.js"

export async function startup(closed: () => void) {
	const code = Sparrow.invites.parse(location.hash)
	const invite = code && Id.fromFancy(decodeURIComponent(code))

	const url = isLocal()
		? `ws://${location.hostname}:8000/`
		: Sparrow.stdUrl()

	return invite
		? JoinerSituation.start(url, invite, closed)
		: HostingSituation.start(url, closed)
}

