
import {Id} from "../../tools/id.js"
import {Hex, hash} from "@benev/slate"

export async function ipToReputation(ip: string, salt: string) {
	const hex = await hash(ip + salt)
	const bytes = Hex.bytes(hex).slice(0, Id.size)
	return Hex.string(bytes)
}

