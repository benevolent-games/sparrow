
import {html, shadowView, Signal} from "@benev/slate"

import stylesCss from "./styles.css.js"
import {Lobby} from "../../logic/types.js"
import userSvg from "../../icons/tabler/user.svg.js"

export const LobbyView = shadowView(use => (
		selfId: string,
		lobby: Signal<Lobby>,
		closeConnection?: (id: string) => void,
	) => {

	use.styles(stylesCss)

	return html`
		<ul x-group>
			${lobby.value.people.map(({agent, connected, iceCounts}) => html`
				<li
					?x-connected="${connected}"
					?x-self="${selfId === agent.id}"
					?x-host="${lobby.value.hostId === agent.id}">

					${userSvg}

					<span x-id>
						<span>${agent.reputation.slice(0, 4)}</span>
						<span>${agent.id.slice(0, 4)}</span>
					</span>

					<span x-ice>
						<span>ICE:</span>
						<span>${iceCounts.hostSide} local</span>
						<span>${iceCounts.remoteSide} remote</span>
					</span>

					${closeConnection && html`
						<span x-buttons>
							<button @click="${() => closeConnection(agent.id)}">disconnect</button>
						</span>
					`}
				</li>
			`)}
		</ul>
	`
})

