
import stylesCss from "./styles.css.js"
import {html, shadowView} from "@benev/slate"

export const LobbyView = shadowView(use => () => {
	use.styles(stylesCss)

	return html`
		<ul x-group>
			<li>hello</li>
		</ul>
	`
})

