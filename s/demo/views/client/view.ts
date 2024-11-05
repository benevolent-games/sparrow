
import {html, loading, Op, shadowView} from "@benev/slate"

import stylesCss from "./styles.css.js"
import {LobbyView} from "../lobby/view.js"
import {Lobby} from "../../logic/types.js"
import {Sparrow} from "../../../browser/sparrow.js"
import {JoinerSituation} from "../../logic/situations/joiner.js"

export const ClientView = shadowView(use => (situation: JoinerSituation) => {
	use.styles(stylesCss)

	const lobby = situation.lobby.value
	const {self, host} = situation.joined

	const op = lobby
		? Op.ready(lobby)
		: Op.loading<Lobby>()

	return html`
		<h2>Joined <code>${Sparrow.mixedId(host)}</code></h2>

		${loading.binary(op, lobby => LobbyView([self.id, lobby]))}
	`
})

