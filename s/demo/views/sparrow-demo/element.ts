
import {shadowComponent, loading} from "@benev/slate"

import stylesCss from "./styles.css.js"
import {HostView} from "../host/view.js"
import themeCss from "../../theme.css.js"
import {ClientView} from "../client/view.js"
import {startup} from "../../logic/startup.js"
import {HostingSituation} from "../../logic/situations/hosting.js"

export const SparrowDemo = shadowComponent(use => {
	use.styles(themeCss, stylesCss)

	const situationOp = use.load(async() => {
		return await startup(() => situationOp.setError("disconnected"))
	})

	return loading.braille(situationOp, situation => {
		return situation instanceof HostingSituation
			? HostView([situation])
			: ClientView([situation])
	})
})

