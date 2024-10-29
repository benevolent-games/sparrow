
const vowels = [..."aeiouy"]
const consonants = [..."bcdfghjklmnpqrstvwxyz"]

const patterns = {
	firstName: [
		"oxo",
		"ox",
		"oxox",
		"oxoo",
		"ooxo",
		"xo",
		"xox",
		"xoxo",
		"xoxox",
		"xoxxo",
		"xoxxox",
		"xoxoo",
		"xoxoox",
	],
	lastName: [
		"oxxoxo",
		"oxoxxox",
		"oxooxo",
		"oxooxox",
		"oxooxoo",
		"xoxxoxo",
		"xoxxoxox",
		"xoxoxoxo",
		"xoxoxoxox",
		"xoxxoxo",
		"xoxoxxox",
	],
}

function grabOne(arr: string[]) {
	const index = Math.floor(Math.random() * arr.length)
	return arr[index]
}

function generateName(patterns: string[]) {
	const pattern = grabOne(patterns)
	const name: string[] = []

	for (const character of pattern) switch (character) {
		case "x": name.push(grabOne(consonants)); break
		case "o": name.push(grabOne(vowels)); break
		default: name.push(" ")
	}

	return name
		.map((c, i) => i === 0 ? c.toUpperCase() : c)
		.join("")
}

export function syllabicFirstName() {
	return generateName(patterns.firstName)
}

export function syllabicLastName() {
	return generateName(patterns.lastName)
}

export function syllabicName() {
	return `${syllabicFirstName()} ${syllabicLastName()}`
}

