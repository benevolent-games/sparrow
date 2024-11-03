
import {shadowComponent, loading} from "@benev/slate"

import {HostView} from "../host-view/view.js"
import {isLocal} from "../../utils/is-local.js"
import {ClientView} from "../client-view/view.js"
import {Sparrow} from "../../../browser/sparrow.js"
import {parseInvite} from "../../utils/parse-invite.js"
import {Connection} from "../../../browser/utils/connection.js"

import stylesCss from "./styles.css.js"

export const SparrowDemo = shadowComponent(use => {
	use.styles(stylesCss)

	const invite = use.once(() => parseInvite(location.hash))

	const url = use.once(() =>
		isLocal()
			? `ws://${location.hostname}:8000/`
			: Sparrow.stdUrl()
	)

	const op = use.load<Sparrow | Connection>(async() => {
		return invite

			? await Sparrow.join({
				url,
				invite,
				disconnected: () => {
					op.setError("the connection to sparrow died")
				},
			})

			: await Sparrow.host({
				url,
				allow: async() => true,
				connecting: prospect => {
					return connection => {
						return () => {
							prospect.close()
						}
					}
				},
				closed: () => {
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

