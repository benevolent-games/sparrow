
import {Base58, Bytename, Hex} from "@benev/slate"

export const Id = Object.freeze({
	size: 8,

	random() {
		return Hex.random(this.size)
	},

	toDisplay(hex: string) {
		return Base58.string(Hex.bytes(hex))
	},

	fromDisplay(display: string) {
		return Hex.string(Base58.bytes(display))
	},

	toDisplayName(id: string, reputation: string) {
		const firstName = Bytename.string(Hex.bytes(id).slice(0, 2), "Xxxxxx ")
		const lastName = Bytename.string(Hex.bytes(reputation).slice(0, 3), "Xxxxxxxxx ")
		return `${firstName} ${lastName}`
	},
})

