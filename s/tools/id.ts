
import {Base58, Hex, Bytename} from "@e280/stz"

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
		const firstName = Bytename.fromBytes(
			Hex.bytes(id).slice(0, 2)
		)
		const lastName = Bytename.fromBytes(
			Hex.bytes(reputation).slice(0, 2)
		)
		return `${firstName} ${lastName}`
	},
})

