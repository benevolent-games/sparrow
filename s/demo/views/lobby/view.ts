
import {html, shadowView, Signal} from "@benev/slate"
import {Lobby} from "../../logic/types.js"

import stylesCss from "./styles.css.js"
import themeCss from "../../theme.css.js"

export const LobbyView = shadowView(use => (
		selfId: string,
		lobby: Signal<Lobby>,
		killProspect?: (id: string) => void,
	) => {

	use.name("lobby")
	use.styles(themeCss, stylesCss)

	return html`
		<ul>
			${lobby.value.people.map(({agent, details, scenario}) => html`
				<li
					x-scenario="${scenario.kind}"
					?x-self="${selfId === agent.id}"
					?x-host="${lobby.value.hostId === agent.id}">

					<span x-icon>
						${details.emoji}
					</span>

					<span x-name>
						${details.name}
					</span>

					<span x-id>
						${agent.reputation.slice(0, 4)}.${agent.id.slice(0, 4)}
					</span>

					<span x-ice>
						${(scenario.kind === "connecting" || scenario.kind === "connected")
							? `${scenario.iceCounts.hostSide}/${scenario.iceCounts.remoteSide}`
							: `host`}
					</span>

					<span x-buttons>
						${(scenario.kind !== "local" && killProspect) ? html`
							<button @click="${() => killProspect(agent.id)}">kick</button>
						` : null}
					</span>
				</li>
			`)}
		</ul>
	`
})

