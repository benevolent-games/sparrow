
import {css} from "@benev/slate"
export default css`

:host {
	display: block;
}

ul {
	display: flex;
	flex-direction: column;
	gap: 0.5rem;

}

li {
	position: relative;
	display: flex;
	align-items: center;
	gap: 1em;

	background: #443f64;
	border-radius: 0.3em;
	padding: 0.8em;
	box-shadow: .1em .2em .3em #0004;

	&[x-self] {
		background: #724399;
		&::before {
			content: "You";
			display: block;
			position: absolute;
			right: calc(100% - 0.2em);
			top: -0.2em;
			padding: 0.3em;
			border-radius: 0.5em;
			background: #aa0;
			font-weight: bold;
			box-shadow: .1em .2em .3em #0004;
		}
	}

	&[x-scenario="connecting"] {
		background: transparent;
		box-shadow: none;
		&::after {
			content: "Connecting";
			display: block;
			position: absolute;
			right: -0.2em;
			top: -0.2em;
			padding: 0.3em;
			border-radius: 0.5em;
			background: #aaa4;
			font-weight: bold;
			box-shadow: .1em .2em .3em #0004;
		}
	}

	[x-icon] {
		font-size: 2em;
	}

	[x-name] {
		flex: 1 1 auto;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
		font-weight: bold;
	}

	[x-id] {
		font-family: monospace;
		color: #00ff1c;

		width: 6em;
		text-align: center;
	}

	[x-ice] {
		font-family: monospace;

		width: 3em;
		text-align: center;
	}

	[x-buttons] {
		width: 3em;
		text-align: center;
	}
}

`

