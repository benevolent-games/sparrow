
import {html, shadowView} from "@benev/slate"
import stylesCss from "./styles.css.js"
import {Connected} from "../../../negotiation/utils/connected.js"

export const ClientView = shadowView(use => (connected: Connected, url: string) => {
	use.styles(stylesCss)

	return html`
		<section>
			<h2>Joined <code>${connected.agent.id.slice(0, 8)}</code></h2>
		</section>
	`
})

