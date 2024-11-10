
import {html, shadowView} from "@benev/slate"

import {Id} from "../../../tools/id.js"
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
					<h3>You're Hosting a Session</h3>
					<div x-unit>
						<div>
							${crownSvg}
						</div>
						<ul>
							<li>
								<span>Id</span>
								<code>${Id.toDisplay(id)}</code>
							</li>
							<li>
								<span>Reputation</span>
								<code>${Id.toDisplay(reputation)}</code>
							</li>
							<li>
								<span>Invite</span>
								<span>
									<a href="${Sparrow.invites.url(Id.toDisplay(invite))}" target="_blank">
										${Sparrow.invites.url(Id.toDisplay(invite).slice(0, 5))}
									</a>
								</span>
							</li>
						</ul>
					</div>
				</div>

				<div x-card>
					<h3>Signaller Stats</h3>
					<div x-unit>
						<div>
							${chartBarPopularSvg}
						</div>
						<ul>
							<li>
								<span>Hosting now</span>
								<code>${stats.agents}</code>
							</li>
							<li>
								<span>Daily connections</span>
								<code>${stats.daily.connections}</code>
							</li>
							<li>
								<span>Daily failures</span>
								<code>${stats.daily.failures}</code>
							</li>
						</ul>
					</div>
				</div>

			</div>
		</section>

		${LobbyView([id, situation.lobby.value, id => situation.killUser(id)])}
	`
})

