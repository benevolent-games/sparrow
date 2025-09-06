
import {css} from "lit"
import {cssReset} from "@e280/sly"
export default css`

${cssReset}

a {
	color: var(--link);
	text-decoration: none;

	&:visited {
		filter: brightness(90%);
	}

	&:is(:hover, :focus) {
		filter: brightness(120%);
		text-decoration: underline;
	}

	&:active {
		filter: brightness(80%);
	}
}

button {
	cursor: pointer;
	padding: 0.5em;
	font-weight: bold;
	color: #ccc;
	background: #444;
	border: 1px solid currentColor;
	border-radius: 0.3em;
	box-shadow: .1em .2em .3em #0008;

	&:is(:hover, :focus) { filter: brightness(120%); }
	&:is(:active) { filter: brightness(80%); }
}

`
