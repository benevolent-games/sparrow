
/** parse an invite id from the url hash `window.location.hash` */
export function parseInvite(hash: string): string | undefined {
	const [,invite] = hash.match(/invite=([0-9a-f]{64})/i) ?? []
	return invite
}

