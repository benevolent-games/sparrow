
import {shadowComponent, loading} from "@benev/slate"

import stylesCss from "./styles.css.js"
import {HostView} from "../host-view/view.js"
import {isLocal} from "../../utils/is-local.js"
import {ClientView} from "../client-view/view.js"
import {Sparrow} from "../../../browser/sparrow.js"
import {parseInvite} from "../../utils/parse-invite.js"
import {Connected} from "../../../negotiation/utils/connected.js"

export const SparrowDemo = shadowComponent(use => {
	use.styles(stylesCss)

	const invite = use.once(() => parseInvite(location.hash))

	const url = use.once(() =>
		isLocal()
			? `ws://${location.hostname}:8000/`
			: Sparrow.stdUrl()
	)

	const op = use.load<Sparrow | Connected>(async() => {
		return invite

			? await Sparrow.join({
				url,
				invite,
				hostClosed: () => {
					console.log("host closed")
					op.setError("the connection to sparrow died")
				},
			})

			: await Sparrow.connect({
				url,
				sparrowClosed: () => {
					op.setError("the connection to sparrow died")
				},
			})
	})

	return loading.braille(op, x => {
		return x instanceof Sparrow
			? HostView([x, url])
			: ClientView([x, url])
	})
})

