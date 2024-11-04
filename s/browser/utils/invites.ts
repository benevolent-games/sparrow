
export const invites = {

	/** parse an invite id from the url hash `window.location.hash` */
	parse: (hash: string): string | undefined => {
		const [,invite] = hash.match(/invite=([0-9a-f]{64})/i) ?? []
		return invite
	},

	/** make link url */
	makeLinkUrl: (invite: string) => {
		return `#invite=${invite}`
	},

	/** a truncated version of the link url, for display purposes */
	makeLinkDisplay: (invite: string) => {
		return `#invite=${invite.slice(0, 5)}..`
	},
}

