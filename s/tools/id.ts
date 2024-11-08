
import {Anka, Base58, Bytename, Hex} from "@benev/slate"

export const Id = Object.freeze({
	size: 8,

	random() {
		return Hex.random(this.size)
	},

	toNormal(hex: string) {
		return Base58.string(Hex.bytes(hex))
	},

	fromNormal(display: string) {
		return Hex.string(Base58.bytes(display))
	},

	toFancy(hex: string) {
		return Anka.string(Hex.bytes(hex))
	},

	fromFancy(display: string) {
		return Hex.string(Anka.bytes(display))
	},

	toDisplayName(id: string, reputation: string) {
		const firstName = Bytename.string(Hex.bytes(id).slice(0, 3), "Xxx Xxxxxx ")
		const lastName = Bytename.string(Hex.bytes(reputation).slice(0, 3), "Xxxxxxxxx ")
		return `${firstName} ${lastName}`
	},
})

