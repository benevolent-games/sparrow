
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
	display: flex;
	align-items: center;
	gap: 1em;

	background: #443f64;
	border-radius: 0.3em;
	padding: 0.8em;
	box-shadow: .1em .2em .3em #0004;

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

	[x-endcap] {
		display: flex;
		gap: 1em;
		min-width: 5em;
		justify-content: end;
		align-items: center;

		> [x-ice] { margin-right: auto; }
	}

	[x-id] {
		display: flex;
		font-family: monospace;
		color: #00ff1c;
	}

	[x-ice] {
		font-family: monospace;
	}
}

`

