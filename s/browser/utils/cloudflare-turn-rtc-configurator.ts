
import {RtcConfigurator} from "../types.js"
import {rtcPresets} from "../std/rtc-configurator.js"

export const cloudflareRtcConfigurator: RtcConfigurator = async({signaller}) => {
	const rtc = rtcPresets.std()
	const turn = await signaller.turnCloudflare()
	rtc.iceServers.push(turn)
	return rtc
}

