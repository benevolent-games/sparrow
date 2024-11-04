
import {html, shadowView} from "@benev/slate"

import stylesCss from "./styles.css.js"
import {LobbyView} from "../lobby/view.js"

import crownSvg from "../../icons/tabler/crown.svg.js"
import {HostingSituation} from "../../logic/situations/hosting.js"
import chartBarPopularSvg from "../../icons/tabler/chart-bar-popular.svg.js"

export const HostView = shadowView(use => (situation: HostingSituation) => {
	use.styles(stylesCss)
	const stats = situation.stats.value
	const {invite} = situation.hosted
	const {id, reputation} = situation.hosted.self

	return html`
		<section x-plate>
			<h2>Connected to <code>${situation.url}</code></h2>
			<div x-cards>

				<div>
					<div>
						${crownSvg}
					</div>
					<ul>
						<li>
							<span>Id</span>
							<code>${id.slice(0, 8)}</code>
						</li>
						<li>
							<span>Reputation</span>
							<code>${reputation.slice(0, 8)}</code>
						</li>
						<li>
							<span>Invite</span>
							<span>
								<a href="${`#invite=${invite}`}" target="_blank">
									${`#invite=${invite.slice(0, 8)}`}
								</a>
							</span>
						</li>
					</ul>
				</div>

				<div>
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
				</div>

			</div>

			${LobbyView([id, situation.lobby, id => situation.killProspect(id)])}
		</section>
	`
})

