
import {css} from "@benev/slate"
export default css`

:host > * + * {
	margin-top: 1em;
}

code {
	color: #2cff00;
	font-weight: bold;
}

h2, h3 {
	font-size: 0.7rem;
	color: #fff8;
	background: #fff2;
	text-shadow: none;
}

[x-plate] {
	display: flex;
	flex-direction: column;
	max-width: 100%;
	background: #347297;
	box-shadow: .1em .2em .5em #0006;
	border-radius: 0.2em;

	> h2 {
		display: flex;
		flex-direction: column;
		text-align: center;
		padding: 0.5em;

		> span {
			text-transform: uppercase;
		}
	}

	& [x-cards] {
		display: flex;
		flex: 1 0 auto;
		flex-wrap: wrap;
		gap: 1em;
		padding: 1em;
	}

	& [x-card] {
		flex: 1 0 auto;
		display: flex;
		flex-direction: column;
		background: #fff2;
		box-shadow: .1em .2em .5em #0003;
		border-radius: 0.2em;

		> h3 {
			padding: 0.2rem;
			text-align: center;
			text-transform: uppercase;
		}
	}

	& [x-unit] {
		display: flex;
		padding: 0.5em;
		gap: 1em;
		justify-content: center;

		> div {
			display: flex;
			justify-content: center;
			align-items: center;

			> svg {
				width: 3em;
				height: 3em;
			}
		}

		> ul {
			list-style: none;
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: start;

			> li {
				width: 100%;
				display: flex;
				gap: 1em;
				> *:nth-child(1) { flex: 1 0 auto; }
			}
		}
	}
}

[view="lobby"] {
	margin-top: 0.5em;
}

`

