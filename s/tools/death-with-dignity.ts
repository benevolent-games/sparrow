
export function deathWithDignity() {

	process.on("SIGINT", () => {
		console.log("💣 SIGINT")
		process.exit(0)
	})

	process.on("SIGTERM", () => {
		console.log("🗡️ SIGTERM")
		process.exit(0)
	})

	process.on("uncaughtException", error => {
		console.error("🚨 unhandled exception:", error)
		process.exit(1)
	})

	process.on("unhandledRejection", (reason, error) => {
		console.error("🚨 unhandled rejection:", reason, error)
		process.exit(1)
	})
}
