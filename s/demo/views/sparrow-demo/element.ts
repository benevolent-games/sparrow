
import {shadowComponent, loading} from "@benev/slate"

import stylesCss from "./styles.css.js"
import {HostView} from "../host-view/view.js"
import {startup} from "../../logic/startup.js"
import {ClientView} from "../client-view/view.js"
import {HostingSituation} from "../../logic/situations/hosting.js"

export const SparrowDemo = shadowComponent(use => {
	use.styles(stylesCss)
	const situationOp = use.load(async() => {
		return await startup(() => console.log("STARTUP CLOSED"))
	})

	return loading.braille(situationOp, situation => {
		return situation instanceof HostingSituation
			? HostView([situation])
			: ClientView([situation])
	})
})

