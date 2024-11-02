
import {html, shadowView} from "@benev/slate"

import {Lobby} from "./lobby.js"
import stylesCss from "./styles.css.js"
import userSvg from "../../icons/tabler/user.svg.js"
import {Sparrow} from "../../../browser/sparrow.js"

export const LobbyView = shadowView(use => (
		selfId: string,
		lobby: Lobby,
		sparrow?: Sparrow,
	) => {

	use.styles(stylesCss)

	const controls = sparrow ? {
		killConnection: (id: string) => {
			const connection = sparrow.requireConnection(id)
			connection.close()
		},
	} : null

	return html`
		<ul x-group>
			${lobby.people.map(({agent, connected, iceCounts}) => html`
				<li
					?x-connected="${connected}"
					?x-self="${selfId === agent.id}"
					?x-host="${lobby.hostId === agent.id}">

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

					${controls && html`
						<span x-buttons>
							<button @click="${() => controls.killConnection(agent.id)}">disconnect</button>
						</span>
					`}
				</li>
			`)}
		</ul>
	`
})

