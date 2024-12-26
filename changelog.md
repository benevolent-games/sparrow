
# changelog for `sparrow-rtc`

- 🟥 *harmful -- breaking change*
- 🔶 *maybe harmful -- deprecation, or possible breaking change*
- 🍏 *harmlesss -- addition, fix, or enhancement*

<br/>

## v0.2

### v0.2.3
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

