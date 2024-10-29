
export function roomLink(link: string, term: string, roomId: string) {
	const url = new URL(link)
	url.hash = `#${term}=${roomId}`
	return url.toString()
}

