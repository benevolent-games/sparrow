
import {shadowComponent, html} from "@benev/slate"

import stylesCss from "./styles.css.js"
import {isLocal} from "../../utils/is-local.js"
import {Sparrow} from "../../../browser/sparrow.js"
import {StdDataChannels} from "../../../negotiation/types.js"
import {Connected} from "../../../negotiation/partnerutils/connected.js"

export const SparrowDemo = shadowComponent(use => {
	use.styles(stylesCss)

	const peers = use.once(() => new Set<Connected<StdDataChannels>>())

	const sparrowOp = use.load(async() => Sparrow.connect({
		url: isLocal()
			? `ws://${location.hostname}:8000/`
			: Sparrow.stdUrl(),

		joined: peer => {
			peers.add(peer)
			use.rerender()
			return () => {
				peers.delete(peer)
				use.rerender()
			}
		},

		sparrowClosed: () => {
			sparrowOp.setError("the connection to sparrow died")
		},
	}))

	return html`
		<p>todo</p>
	`
})

