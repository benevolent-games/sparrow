
import {css} from "@benev/slate"
export default css`

a {
	color: var(--link);
	text-decoration: none;

	&:visited {
		color: color-mix(in srgb, purple, var(--link) 70%);
	}

	&:hover {
		color: color-mix(in srgb, white, var(--link) 90%);
		text-decoration: underline;
	}

	&:active {
		color: color-mix(in srgb, white, var(--link) 50%);
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
