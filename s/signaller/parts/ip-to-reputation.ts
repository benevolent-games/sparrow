
import {Hex} from "@e280/stz"
import * as crypto from "node:crypto"
import {Id} from "../../tools/id.js"

export async function ipToReputation(ip: string, salt: string) {
	const bytes = await hash(ip + salt)
	return Hex.fromBytes(bytes.slice(0, Id.size))
}

export async function hash(input: string) {
	const encoder = new TextEncoder()
	const data = encoder.encode(input)
	const bytes = await crypto.subtle.digest("SHA-256", data)
	return new Uint8Array(bytes)
}

// async function hash(input: string) {
// 	return crypto.createHash("sha256")
// 		.update(input)
// 		.digest("hex")
// }

