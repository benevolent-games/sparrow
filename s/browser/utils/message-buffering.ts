
/** store message events, and re-dispatch them after the first onmessage handler is attached */
export function messageBuffering(channel: RTCDataChannel) {
	const messages: MessageEvent[] = []
	const interceptor = (event: MessageEvent) => messages.push(event)

	channel.addEventListener("message", interceptor)

	const cleanupAndRedispatch = () => {
		channel.removeEventListener("message", interceptor)
		for (const message of messages)
			channel.dispatchEvent(message)
	}



	return new Proxy(channel, {

		// intercept `channel.addEventListener("message", ...)`
		get: (channel, key: keyof RTCDataChannel) => {
			if (key === "addEventListener")
				return (...args: Parameters<typeof channel.addEventListener>) => {
					const [eventName, ...rest] = args
					const result = channel.addEventListener(eventName, ...rest)
					cleanupAndRedispatch()
					return result
				}
			const value = channel[key] as any
			return (value instanceof Function)
				? (...args: any[]) => value.apply(channel, args)
				: value
		},

		// intercept `channel.onmessage = ...`
		set: (channel, key: string, value: any) => {
			const channel2 = channel as any
			channel2[key] = value
			if (key === "onmessage")
				cleanupAndRedispatch()
			return true
		},
	})
}

