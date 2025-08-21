
# `sparrow-rtc` changelog
- 🟥 breaking change
- 🔶 deprecation or possible breaking change
- 🍏 harmless addition, fix, or enhancement

<br/>

## v0.2

### v0.2.12
- 🍏 update dependencies

### v0.2.11
- 🍏 fix release workflow

### v0.2.10
- 🔶 use package.json exports which restricts exportable modules
- 🍏 upgrade to new `@e280/renraku`

### v0.2.9
- 🔶 switch away from various slate tools to the newer `@e280/stz` tools
  - removed slate exports `concurrent`, `Hex`, `Base58`, `Bytename` — instead you should use the upgraded versions of all of these from [`@e280/stz`](https://github.com/e280/stz)
- 🍏 fixed various types
- 🍏 upgraded dependencies

### v0.2.3
- 🔶 fix missing messages via sneaky controversial message buffering
  - before, it was possible to actually miss the initial messages from the host send via data channel, because you might wait for the connection ready promise before proceeding to attach your channel.onmessage handler, which is then too late
  - now, we actually give you a sneaky proxy of the RTCDataChannel instead of the real thing, and we intercept your onmessage/addEventListener "message" event handlers, and we actually re-dispatch the "lost" messages for you -- hopefully fixing this problem without causing further headache
  - this is some sneaky controversial magic, and i'm slightly worried it might possibly cause problems in some cases, but hopefully it actually just makes things work better without confusion 🤷
- 🍏 fix types, generics now use `StdCable` as defaults
- 🍏 fix readme typo, `close` to `closed`
- 🍏 update dependencies

### v0.2.2
- 🔶 renames of some things you're unlikely to be using
  - `Connected` to `SparrowConnect`
  - `Joined` to `SparrowJoin`
  - `Hosted` to `SparrowHost`
  - `Stats` to `SignallerStats`
  - `StatsTimeframe` to `SignallerStatsTimeframe`
- 🍏 automated sparrow signaller stats gathering, doubles as keepalive mechanic (roughly every 14 seconds)
- 🍏 improved typings ergonomics (WelcomeFn and Connection generics default to StdCable)

### v0.2.1
- 🍏 fix project links in package.json
- 🍏 readme tweaks

### v0.2.0
- 🟥 super cool rewrite

<br/>

## v0.1
- 🟥 massive extreme rewrite

<br/>

## v0.0
- 🍏 initial release

