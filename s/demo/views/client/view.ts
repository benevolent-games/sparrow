
import {html, shadowView} from "@benev/slate"

import stylesCss from "./styles.css.js"
import {LobbyView} from "../lobby/view.js"
import {JoinerSituation} from "../../logic/situations/joiner.js"

export const ClientView = shadowView(use => (situation: JoinerSituation) => {
	use.styles(stylesCss)

	const lobby = situation.lobby.value
	const {self, host} = situation.joined

	return html`
		<h2>Joined <code>${host.id.slice(0, 5)}</code></h2>
		${lobby
			? LobbyView([self.id, lobby])
			: null}
	`
})

