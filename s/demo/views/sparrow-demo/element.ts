
import {view} from "@e280/sly"
import stylesCss from "./styles.css.js"
import themeCss from "../../theme.css.js"
import {HostView} from "../host/view.js"
import {loader} from "../../utils/loader.js"
import {ClientView} from "../client/view.js"
import {startup} from "../../logic/startup.js"
import {HostingSituation} from "../../logic/situations/hosting.js"

export const SparrowDemo = view.component(use => {
	use.styles(themeCss, stylesCss)

	const situationOp = use.op(async() => {
		return await startup(() => situationOp.setError("disconnected"))
	})

	return loader(situationOp, situation => {
		return situation instanceof HostingSituation
			? HostView(situation)
			: ClientView(situation)
	})
})

