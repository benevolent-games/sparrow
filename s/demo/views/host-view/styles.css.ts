
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

:host > * + * {
	margin-top: 1em;
}

code {
	color: #ffcb00;
	font-weight: bold;
}

[x-plate] {
	display: flex;
	flex-direction: column;
	max-width: 100%;
	background: #347297;
	box-shadow: .1em .2em .5em #0006;
	border-radius: 0.2em;

	> h2 {
		font-size: 1rem;
		text-align: center;
		padding: 0.5em;
	}

	> [x-cards] {
		display: flex;
		flex: 1 0 auto;
		flex-wrap: wrap;
		gap: 1em;
		padding: 1em;
		background: #0002;

		> div {
			flex: 1 0 auto;
			display: flex;
			padding: 1em;
			background: #fff2;
			box-shadow: .1em .2em .5em #0003;
			border-radius: 0.2em;
			gap: 1em;

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
}

`

