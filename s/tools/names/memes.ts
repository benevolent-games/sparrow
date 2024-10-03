
import {Hat} from "./utils/hat.js"

export class MemeNames {
	adjectives = new Hat([
		"Bingus",
		"Angry", "Shiny", "Lazy", "Drunk", "Psychedelic", "Sassy", "Fluffy", "Bored",
		"Spicy", "Awkward", "Deadpan", "Gigantic", "Tiny", "Moist", "Deranged",
		"Neon", "Hyperactive", "Sleepy", "Salty", "Radioactive", "Suspicious",
		"Hypnotized", "Unstable", "Ferocious", "Flammable", "Goth", "Zombie",
		"Rainbow", "Quantum", "Schizoid", "Sweaty", "Explosive", "Mysterious",
		"Nefarious", "Snarky", "Loud", "Muted", "Invisible", "Eldritch", "Cranky",
		"Outrageous", "Oblivious", "Chaotic", "Unhinged", "Caffeinated", "Paranoid",
		"Woke", "Edgy", "Crunchy", "Jaded", "Cheesy",
		"Arctic", "Antarctic", "Oceanic", "Maritime", "Outdoorsy", "Indoorsy",
		"Frightened", "Adventurous", "Terrified", "Pathetic", "Beastly",
		"Terrorized", "Magnificient", "Ungrateful", "Spineless", "Bony",
		"Cringe", "Cringey", "Based", "Redpilled", "Bluepilled", "Whitepilled", "Blackpilled",
		"Malding", "Soy", "Sigma", "Alpha", "Lit", "Sus", "Goated", "Cracked",
		"Mid", "Bussin'", "Rizzed", "Swole", "Flexin'", "Thicc", "Seething",
		"American", "European", "Latinx", "African", "Asian", "Australian",
		"Unknown", "Known", "Unwanted", "Tense", "Nervous",
		"Unionized",
	])

	nouns = new Hat([
		"Ninja", "Banana", "Platypus", "Vampire", "Toaster", "Spaceship", "Unicorn",
		"Meme", "Goblin", "Squirrel", "Taco", "Cactus", "Octopus", "Dragon",
		"Sock", "Donut", "Laser", "Duck", "Cyborg", "Squid", "Giraffe", "Skeleton",
		"Ghost", "Robot", "Dumpster", "Kangaroo", "Sloth", "Cheeseburger", "Shark",
		"Pineapple", "Broccoli", "Narwhal", "Alien", "Penguin", "Pizza", "Llama",
		"Shovel", "Chainsaw", "Dumpsterfire", "UFO", "Hamster", "Waffle",
		"Poltergeist", "Jellyfish", "Moth", "Pickle", "Zebra", "Tractor",
		"Manatee", "Raccoon", "Moustache", "Goatee", "Ingrate",
		"Boomer", "Zoomer", "Doomer", "Chad", "Stacey", "Karen", "Clown",
		"Simp", "Degen", "Normie", "NPC", "Incel", "Lurker", "Wojack",
		"Doctor", "Lawyer", "Coder", "Barista", "Marshall", "Laborer",
		"Lumberjack", "Sheriff", "Deputy", "Judge", "Surgeon",
 		"Socialist", "Communist", "Capitalist", "Libertarian", "Anarchist",
 		"Reactionary", "Ideologue", "Believer", "Economist", "Politician",
 		"President", "Dictator", "Diplomat",
	])

	suffixes = new Hat([
		"Enjoyer", "Maxxer", "Poster", "Connoisseur", "King", "Queen",
		"Collector", "Aficionado", "Hoarder", "Fanatic", "Noticer",
		"Dweller",
	])

	generate() {
		const adj1 = this.adjectives.pull()
		const adj2 = this.adjectives.pull()
		const noun1 = this.nouns.pull()
		const noun2 = this.nouns.pull()
		const suffix = this.suffixes.pull()

		const formats = [
			`${adj1} ${noun1}`,
			`${adj1} ${noun1} ${suffix}`,
			`${adj1} ${noun1} ${noun2}`,
			`${adj1} ${noun1}-${noun2.toLowerCase()}`,
			`${adj1} ${adj2} ${noun2}`,
		]

		return formats[Math.floor(Math.random() * formats.length)]
	}
}

