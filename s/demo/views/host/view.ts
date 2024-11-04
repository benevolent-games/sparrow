
import {html, shadowView} from "@benev/slate"

import {LobbyView} from "../lobby/view.js"
import {Sparrow} from "../../../browser/sparrow.js"
import {HostingSituation} from "../../logic/situations/hosting.js"

import stylesCss from "./styles.css.js"
import themeCss from "../../theme.css.js"
import crownSvg from "../../icons/tabler/crown.svg.js"
import chartBarPopularSvg from "../../icons/tabler/chart-bar-popular.svg.js"

export const HostView = shadowView(use => (situation: HostingSituation) => {
	use.styles(themeCss, stylesCss)
	const stats = situation.stats.value
	const {invite} = situation.hosted
	const {id, reputation} = situation.hosted.self

	return html`
		<section x-plate>
			<h2>
				<span>Connected to signaller</span>
				<code>${situation.url}</code>
			</h2>
			<div x-cards>

				<div x-card>
					<h3>Session You're Hosting</h3>
					<div x-unit>
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
									<a href="${Sparrow.invites.makeLinkUrl(invite)}" target="_blank">
										${Sparrow.invites.makeLinkDisplay(invite)}
									</a>
								</span>
							</li>
						</ul>
					</div>
				</div>

				<div x-card>
					<h3>Global Sparrow Stats</h3>
					<div x-unit>
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

			</div>
		</section>

		${LobbyView([id, situation.lobby, id => situation.killProspect(id)])}
	`
})

