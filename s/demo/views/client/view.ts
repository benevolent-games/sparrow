
import {html} from "lit"
import {Op, view} from "@e280/sly"

import {Id} from "../../../tools/id.js"
import stylesCss from "./styles.css.js"
import themeCss from "../../theme.css.js"
import {LobbyView} from "../lobby/view.js"
import {Lobby} from "../../logic/types.js"
import {JoinerSituation} from "../../logic/situations/joiner.js"
import {loader} from "../../utils/loader.js"

export const ClientView = view(use => (situation: JoinerSituation) => {
	use.styles(themeCss, stylesCss)

	const lobby = situation.lobby.value
	const {self, invite} = situation.joined

	const op = lobby
		? Op.ready(lobby)
		: Op.loading<Lobby>()

	return html`
		<h2>Joined <code>${Id.toDisplay(invite)}</code></h2>

		${loader(op, lobby => LobbyView(self.id, lobby))}
	`
})

