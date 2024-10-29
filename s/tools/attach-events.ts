
export function attachEvents<E extends Record<string, (e: any) => void>>(target: EventTarget, events: E) {
	const entries = Object.entries(events)

	for (const [event, listener] of entries)
		target.addEventListener(event, listener as any)

	return () => entries.forEach(([event, listener]) => target.removeEventListener(event, listener as any))
}

