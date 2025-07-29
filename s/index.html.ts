
import {ssg, html} from "@e280/scute"

const title = "sparrow"
const description = "webrtc connectivity library"
const favicon = "/assets/sparrow-256.png"

export default ssg.page(import.meta.url, async orb => ({
	title,
	dark: true,
	js: "demo/main.bundle.min.js",
	css: "demo/stylesheet.css",
	favicon,

	socialCard: {
		themeColor: "#acf",
		title,
		description,
		siteName: "https://sparrow.e280.org/",
		image: "https://sparrow.e280.org" + favicon,
	},

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
			<p><a href="/" target=_blank>Click here</a> to host a new session.</p>
			<p><small>${orb.packageVersion()}</small></p>
		</footer>
	`,
}))

