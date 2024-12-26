
import {html, loading, Op, shadowView} from "@benev/slate"

import {Id} from "../../../tools/id.js"
import stylesCss from "./styles.css.js"
import themeCss from "../../theme.css.js"
import {LobbyView} from "../lobby/view.js"
import {Lobby} from "../../logic/types.js"
import {JoinerSituation} from "../../logic/situations/joiner.js"

export const ClientView = shadowView(use => (situation: JoinerSituation) => {
	use.styles(themeCss, stylesCss)

	const lobby = situation.lobby.value
	const {self, invite} = situation.joined

	const op = lobby
		? Op.ready(lobby)
		: Op.loading<Lobby>()

	return html`
		<h2>Joined <code>${Id.toDisplay(invite)}</code></h2>

		${loading.binary(op, lobby => LobbyView([self.id, lobby]))}
	`
})

