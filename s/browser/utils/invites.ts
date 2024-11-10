
export const invites = {

	/** parse an invite id from the url hash `window.location.hash` */
	parse: (hash: string): string | undefined => {
		const [,invite] = hash.match(/invite=([^&\s]+)/i) ?? []
		return invite
	},

	/** make link url */
	url: (invite: string) => {
		return `#invite=${invite}`
	},
}

