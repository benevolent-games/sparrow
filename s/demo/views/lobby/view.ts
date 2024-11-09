
import {html, shadowView} from "@benev/slate"

import stylesCss from "./styles.css.js"
import themeCss from "../../theme.css.js"
import {Lobby} from "../../logic/types.js"
import {AgentInfo} from "../../../signaller/types.js"
import {Id} from "../../../tools/id.js"

export const LobbyView = shadowView(use => (
		selfId: string,
		lobby: Lobby,
		killProspect?: (id: string) => void,
	) => {

	use.name("lobby")
	use.styles(themeCss, stylesCss)

	const clickKick = killProspect
		? ((agent: AgentInfo) => ({currentTarget}: PointerEvent) => {
			if (currentTarget instanceof HTMLElement)
				currentTarget.blur()
			killProspect(agent.id)
		})
		: null

	return html`
		<ul>
			${lobby.people.map(({agent, details, scenario}) => html`
				<li
					data-id="${agent.id}"
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

					<span x-name title="id ${Id.toDisplay(agent.id)}, reputation ${Id.toDisplay(agent.reputation)}">
						${details.name}
					</span>

					<span x-ice>
						${(scenario.kind === "connecting" || scenario.kind === "connected")
							? "client"
							: "host"}
					</span>

					${clickKick ? html`
						<span x-buttons>
							${(scenario.kind !== "local") ? html`
								<button x-kick @click="${clickKick(agent)}">kick</button>
							` : null}
						</span>
					` : null}
				</li>
			`)}
		</ul>
	`
})

