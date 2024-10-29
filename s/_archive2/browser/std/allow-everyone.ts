
import {DoorPolicyFn} from "../types.js"

export const allowEveryone = (): DoorPolicyFn => {
	return async() => true
}

