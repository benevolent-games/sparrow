
import {html, shadowView} from "@benev/slate"
import stylesCss from "./styles.css.js"
import {JoinerSituation} from "../../logic/situations/joiner.js"

export const ClientView = shadowView(use => (situation: JoinerSituation) => {
	use.styles(stylesCss)

	const {id} = situation.joined.self

	return html`
		<section>
			<h2>Joined <code>${id.slice(0, 8)}</code></h2>
		</section>
	`
})

