
import {css} from "lit"
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

