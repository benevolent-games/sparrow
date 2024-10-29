
export function isLocal() {
	return (
		location.host.startsWith("localhost") ||
		location.host.startsWith("192.") ||
		location.host.startsWith("10.0.")
	)
}

