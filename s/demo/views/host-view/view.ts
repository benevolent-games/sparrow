
import {html, interval, shadowView} from "@benev/slate"
import stylesCss from "./styles.css.js"
import {Stats} from "../../../signaling/api.js"
import {Sparrow} from "../../../browser/sparrow.js"

export const HostView = shadowView(use => (sparrow: Sparrow, url: string) => {
	use.styles(stylesCss)
	const statsOp = use.op<Stats>()

	function refreshStats() {
		statsOp
			.load(() => sparrow.stats())
			.catch(() => {})
	}

	use.mount(() => {
		refreshStats()
		return interval(5000, () => {
			if (!statsOp.isLoading())
				refreshStats()
		})
	})

	return html`
		<section>
			<h2>Connected to <code>${url}</code></h2>
			<div x-cards>
				<div>
					<div>👤</div>
					<ul>
						<li>
							<strong>id</strong>
							<span>${sparrow.id.slice(0, 8)}</span>
						</li>
						<li>
							<strong>reputation</strong>
							<span>${sparrow.reputation.slice(0, 8)}</span>
						</li>
						<li>
							<strong>invite</strong>
							<span>
								<a href="${`#invite=${sparrow.invite}`}" target="_blank">
									${`#invite=${sparrow.invite.slice(0, 8)}...`}
								</a>
							</span>
						</li>
					</ul>
				</div>
			</div>
		</section>
	`
})

