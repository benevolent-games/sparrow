
import {css} from "lit"
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
	flex-wrap: wrap;

	background: #443f64;
	border-radius: 0.3em;
	padding: 0.8em;
	box-shadow: .1em .2em .3em #0004;

	&[x-self] {
		background: #724399;
	}

	&[x-scenario="connecting"] {
		background: transparent;
		box-shadow: none;
	}

	[x-tag] {
		position: absolute;
		padding: 0.3em;
		border-radius: 0.5em;
		background: #aaa4;
		font-weight: bold;
		box-shadow: .1em .2em .3em #0004;

		&[x-tag=self] {
			top: -0.2em;
			right: calc(100% - 0.2em);
			background: #aa0;
		}

		&[x-tag=connecting] {
			top: -0.2em;
			right: -0.2em;
			background: #aaa4;
		}

		&[x-tag=unstable] {
			top: -0.2em;
			right: 25%;
			background: #8008;
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

	[x-report] {
		font-family: monospace;
		width: 6em;
		text-align: center;
	}

	[x-buttons] {
		width: 3em;
		text-align: center;

		[x-kick] {
			&:is(:hover, :focus) {
				color: #f00;
				background: #400;
			}
		}
	}
}

`

