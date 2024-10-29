
import {css} from "@benev/slate"

export default css`

:host > * + * {
	margin-top: 1em;
}

:host > section {
	display: flex;
	flex-direction: column;
	gap: 0.3em;
	color: #fffa;

	> div {
		display: flex;
		flex-direction: column;
		padding-left: 1em;

		> strong {
			color: #fff8;
		}

		> span {
			padding-left: 1em;
			font-family: monospace;
			color: lime;
		}
	}
}

`

