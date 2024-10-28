
import "@benev/slate/x/node.js"
import {template, html, easypage, headScripts, git_commit_hash, read_file, unsanitized} from "@benev/turtle"

export default template(async basic => {
	const path = basic.path(import.meta.url)
	const hash = await git_commit_hash()

	return easypage({
		path,
		dark: true,
		title: "sparrow-rtc",
		head: html`
			<link rel="icon" href="/assets/sparrow-256.png"/>
			<style>${unsanitized(await read_file("x/demo/stylesheet.css"))}</style>
			<meta data-commit-hash="${hash}"/>
			${headScripts({
				devModulePath: await path.version.root("demo/main.bundle.js"),
				prodModulePath: await path.version.root("demo/main.bundle.min.js"),
				importmapContent: await read_file("x/importmap.json"),
			})}
		`,
		body: html`
			<h1 class=title>
				<img src="/assets/sparrow.avif" alt=""/>
				<span>sparrow-rtc</span>
			</h1>

			<main>
				<sparrow-demo></sparrow-demo>
			</main>

			<footer>
				<p>Sparrow makes WebRTC easy, learn more on the <a href="https://github.com/chase-moskal/sparrow-rtc" target=_blank>GitHub</a> page.</p>
			</footer>
		`,
	})
})

