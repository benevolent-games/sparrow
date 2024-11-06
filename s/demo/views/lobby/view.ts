
import {html, shadowView} from "@benev/slate"
import {Lobby} from "../../logic/types.js"

import stylesCss from "./styles.css.js"
import themeCss from "../../theme.css.js"
import {Sparrow} from "../../../browser/sparrow.js"

export const LobbyView = shadowView(use => (
		selfId: string,
		lobby: Lobby,
		killProspect?: (id: string) => void,
	) => {

	use.name("lobby")
	use.styles(themeCss, stylesCss)

	return html`
		<ul>
			${lobby.people.map(({agent, details, scenario}) => html`
				<li
					x-scenario="${scenario.kind}"
					?x-self="${agent.id === selfId}"
					?x-host="${agent.id === lobby.hostId}"
					?x-unstable="${!details.stable}"
					>

					${(agent.id === selfId)
						? html`<span x-tag=self>You</span>`
						: null}

					${(scenario.kind === "connecting")
						? html`<span x-tag=connecting>Connecting</span>`
						: null}

					${(!details.stable)
						? html`<span x-tag=unstable>Unstable</span>`
						: null}

					<span x-icon>
						${details.emoji}
					</span>

					<span x-name>
						${details.name}
					</span>

					<span x-id title="id=${agent.id.slice(0, 10)}, reputation=${agent.reputation.slice(0, 10)}">
						${Sparrow.mixedId(agent)}
					</span>

					<span x-ice>
						${(scenario.kind === "connecting" || scenario.kind === "connected")
							? html`
								<span title="ice report (host:client)">
									${scenario.iceCounts.hostSide}:${scenario.iceCounts.remoteSide}
								</span>
							`
							: `host`}
					</span>

					${!!killProspect ? html`
						<span x-buttons>
							${(scenario.kind !== "local" && killProspect) ? html`
								<button x-kick @click="${() => killProspect(agent.id)}">kick</button>
							` : null}
						</span>
					` : null}
				</li>
			`)}
		</ul>
	`
})

