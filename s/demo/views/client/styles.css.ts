
import {css} from "@benev/slate"
export default css`

:host {
	display: flex;
	flex-direction: column;
	width: 100%;
}

:host > * + * {
	margin-top: 1em;
}

h2 {
	text-align: center;
}

code {
	color: lime;
}

[view="loading-indicator"] {
	display: block;
	text-align: center;
}

footer {
	text-align: center;
}

`

