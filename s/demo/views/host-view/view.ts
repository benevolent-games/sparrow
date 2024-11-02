
import {html, loading, shadowView} from "@benev/slate"

import stylesCss from "./styles.css.js"
import {LobbyView} from "../lobby/view.js"
import {makeLobby} from "../lobby/lobby.js"
import {Stats} from "../../../signaling/types.js"
import {Sparrow} from "../../../browser/sparrow.js"

import crownSvg from "../../icons/tabler/crown.svg.js"
import chartBarPopularSvg from "../../icons/tabler/chart-bar-popular.svg.js"

export const HostView = shadowView(use => (sparrow: Sparrow, url: string) => {
	use.styles(stylesCss)
	const statsOp = use.op<Stats>()
	const lobby = makeLobby(sparrow)

	use.mount(() => sparrow.onChange(() => use.rerender()))

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
		<section x-plate>
			<h2>Connected to <code>${url}</code></h2>
			<div x-cards>

				<div>
					<div>
						${crownSvg}
					</div>
					<ul>
						<li>
							<span>Id</span>
							<code>${sparrow.id.slice(0, 8)}</code>
						</li>
						<li>
							<span>Reputation</span>
							<code>${sparrow.reputation.slice(0, 8)}</code>
						</li>
						<li>
							<span>Invite</span>
							<span>
								<a href="${`#invite=${sparrow.invite}`}" target="_blank">
									${`#invite=${sparrow.invite.slice(0, 8)}`}
								</a>
							</span>
						</li>
					</ul>
				</div>

				<div>
					${loading.braille(statsOp, stats => html`
						<div>
							${chartBarPopularSvg}
						</div>
						<ul>
							<li>
								<span>Hosting</span>
								<code>${stats.agents}</code>
							</li>
							<li>
								<span>Hourly connections</span>
								<code>${stats.hourly.connections}</code>
							</li>
							<li>
								<span>Hourly failures</span>
								<code>${stats.hourly.failures}</code>
							</li>
						</ul>
					`)}
				</div>

			</div>

			${LobbyView([sparrow.id, lobby, sparrow])}
		</section>
	`
})

