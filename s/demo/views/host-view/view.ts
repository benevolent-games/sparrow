
import {html, loading, shadowView} from "@benev/slate"
import stylesCss from "./styles.css.js"
import {Stats} from "../../../signaling/api.js"
import {Sparrow} from "../../../browser/sparrow.js"

export const HostView = shadowView(use => (sparrow: Sparrow, url: string) => {
	use.styles(stylesCss)
	const statsOp = use.op<Stats>()

	use.mount(() => {
		let active = true
		function repeat() {
			if (active) {
				sparrow
					.stats()
					.then(stats => statsOp.setReady(stats))
					.finally(() => setTimeout(repeat, 4_500))
			}
		}
		repeat()
		return () => { active = false }
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

				<div>
					${loading.braille(statsOp, stats => html`
						<div>📜</div>
						<ul>
							<li>
								<strong>hosts</strong>
								<span>${stats.agents}</span>
							</li>
							<li>
								<strong>last hour connections</strong>
								<span>${-1}</span>
							</li>
							<li>
								<strong>last hour failures</strong>
								<span>${-1}</span>
							</li>
						</ul>
					`)}
				</div>

			</div>
		</section>
	`
})

