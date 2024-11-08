
import {Base58} from "@benev/slate"

export const idSize = 8

export function makeId() {
	return Base58.random(idSize)
}

