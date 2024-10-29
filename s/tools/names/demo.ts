
import {MemeNames} from "./memes.js"
import {syllabicName} from "./syllabic.js"

console.log("====== syllabic names ======")

for (let i = 0; i < 20; i++)
	console.log(" - ", syllabicName())

const memes = new MemeNames()

console.log("====== meme names ======")

for (let i = 0; i < 20; i++)
	console.log(" - ", memes.generate())

