
export type DeferredPromise<R> = {
	promise: Promise<R>
	resolve: (result: R) => void
	reject: (reason: any) => void
}

export function deferredPromise<R>(): DeferredPromise<R> {
	let resolve!: (result: R) => void
	let reject!: (reason: any) => void

	const promise = new Promise<R>((res, rej) => {
		resolve = res
		reject = rej
	})

	return {promise, resolve, reject}
}

