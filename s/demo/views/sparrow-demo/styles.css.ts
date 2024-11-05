
import {css} from "@benev/slate"
export default css`

:host {
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
}

slate-view {
	display: block;
	width: 100%;
}

[view="loading-indicator"], [view="error-indicator"] {
	text-align: center;
}

`

