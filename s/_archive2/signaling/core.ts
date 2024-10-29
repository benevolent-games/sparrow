
import {Rooms} from "./parts/rooms.js"
import {BrowserApi} from "../browser/api.js"
import {People, Person} from "./parts/people.js"
import {FunnyNames} from "../tools/funny-names.js"

export class Core {
	people = new People()
	rooms = new Rooms()
	#funnyNames = new FunnyNames()

	acceptNewPerson(browserApi: BrowserApi, disconnect: () => void) {
		const name = this.#funnyNames.generate()
		const person = new Person(name, browserApi, disconnect)
		this.people.add(person)
		return person
	}

	personDisconnected(person: Person) {
		this.people.remove(person)

		// remove any rooms which this person is hosting
		for (const room of this.rooms.values()) {
			if (room.host === person) {
				this.rooms.delete(room.id)
				break
			}
		}
	}
}

