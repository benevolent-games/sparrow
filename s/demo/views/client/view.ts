
import {html, loading, Op, shadowView} from "@benev/slate"

import stylesCss from "./styles.css.js"
import {LobbyView} from "../lobby/view.js"
import {Lobby} from "../../logic/types.js"
import {Sparrow} from "../../../browser/sparrow.js"
import {JoinerSituation} from "../../logic/situations/joiner.js"
import {Id} from "../../../tools/id.js"

export const ClientView = shadowView(use => (situation: JoinerSituation) => {
	use.styles(stylesCss)

	const lobby = situation.lobby.value
	const {self, invite} = situation.joined

	const op = lobby
		? Op.ready(lobby)
		: Op.loading<Lobby>()

	return html`
		<h2>Joined <code>${Id.toFancy(invite)}</code></h2>

		${loading.binary(op, lobby => LobbyView([self.id, lobby]))}
	`
})

