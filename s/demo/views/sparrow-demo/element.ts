
import {shadowComponent, html, loading, interval} from "@benev/slate"

import stylesCss from "./styles.css.js"
import {Stats} from "../../../signaling/api.js"
import {isLocal} from "../../utils/is-local.js"
import {Sparrow} from "../../../browser/sparrow.js"
import {StdDataCable} from "../../../negotiation/types.js"
import {Connected} from "../../../negotiation/partnerutils/connected.js"

export const SparrowDemo = shadowComponent(use => {
	use.styles(stylesCss)

	const statsOp = use.op<Stats>()
	const connectedSet = use.once(() => new Set<Connected<StdDataCable>>())

	const sparrowOp = use.load(async() => {
		const sparrow = await Sparrow.connect({
			url: isLocal()
				? `ws://${location.hostname}:8000/`
				: Sparrow.stdUrl(),

			joined: peer => {
				connectedSet.add(peer)
				use.rerender()

				return () => {
					connectedSet.delete(peer)
					use.rerender()
				}
			},

			sparrowClosed: () => {
				sparrowOp.setError("the connection to sparrow died")
			},
		})
		statsOp.load(async() => sparrow.stats())
		return sparrow
	})

	use.mount(() => interval(5000, () => {
		if (sparrowOp.isReady() && statsOp.isReady())
			statsOp.load(async() => sparrowOp.payload.stats())
	}))

	return html`
		${loading.braille(sparrowOp, sparrow => html`
			<section>
				<h1>Connected to Signal Server</h1>
				<div>
					<strong>Id:</strong>
					<span>${sparrow.id}</span>
				</div>
				<div>
					<strong>Reputation:</strong>
					<span>${sparrow.reputation}</span>
				</div>
				<div>
					<strong>Invite:</strong>
					<span>${sparrow.invite}</span>
				</div>
			</section>
		`)}

		${loading.braille(statsOp, stats => html`
			<section>
				<h1>Stats</h1>
				<div>
					<strong>Agents Connected:</strong>
					<span>${stats.agents}</span>
				</div>
			</section>
		`)}
	`
})

