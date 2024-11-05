
![](https://i.imgur.com/p0EFnnU.png)

# 🐦 Sparrow RTC

🌟 ***Sparrow makes WebRTC easy.***  
🫂 WebRTC is peer-to-peer networking between browser tabs.  
🎮 Perfect for making player-hosted multiplayer web games.  
💖 Free and open source.  

<br/>

## 🐦 Hosting and Joining

1. **Install `sparrow-rtc`**
    ```sh
    npm i sparrow-rtc
    ```
1. **Host a session**
    ```ts
    import Sparrow from "sparrow-rtc"

    const hosted = await Sparrow.host({

      // somebody's requesting to join, will you allow it?
      allow: async({id, reputation}) => true,

      // accept people joining
      connecting: prospect => connection => {
        console.log(`somebody connected: ${connection.id}`)

        // send and receive data
        connection.cable.reliable.send("hello")
        connection.cable.reliable.onmessage = e => console.log("received", m.data)

        return () => console.log(`somebody disconnected: ${connection.id}`)
      },

      // handler for when connection to sparrow signaller is severed
      close: () => console.log(`connection to sparrow server has died`),
    })

    // anybody with this invite code can join
    hosted.invite
      // "8ab469956da27aff3825a3681b4f6452"
    ```
1. **Join that session**
    ```ts
    import Sparrow from "sparrow-rtc"

    const joined = await Sparrow.join({
      invite: "8ab469956da27aff3825a3681b4f6452",
      disconnected: () => console.log(`disconnected from host`),
    })

    // send and receive data
    joined.connection.cable.reliable.send("world")
    joined.connection.cable.reliable.onmessage = m => console.log("received", m.data)
    ```

<br/>

## 🐦 Custom URLs

- `Sparrow.host` and `Sparrow.join` both accept these common options
  ```ts
  import {Sparrow} from "sparrow-rtc"

  const hosted = await Sparrow.host({
    ...myOtherOptions,

    // sparrow's official signaller instance (default shown)
    url: "wss://signaller.sparrow.benev.gg/",

    // stun and/or turn servers (default shown)
    rtcConfig: {
      iceServers: [
        {urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"]},
        {urls: ["stun.services.mozilla.com:3478"]},
        {urls: ["stun:server2024.stunprotocol.org:3478"]},
      ],
    },
  })
- For the `rtcConfig` option, you can use these [preconfigured rtcConfigs](./s/browser/std/rtc-config.ts)
  - `Sparrow.rtcConfig.std` -- a combination of several sources (default)
  - `Sparrow.rtcConfig.google` -- only use google's servers
  - `Sparrow.rtcConfig.mozilla` -- only use mozilla's servers
  - `Sparrow.rtcConfig.stunprotocol` -- only use stunprotocol.org's servers

<br/>

## 🐦 Custom Cables

- You can prepare any kinds of RTC Data Channels you like, by establishing your own `cableConfig`
  ```ts
  // import various helpers
  import {Sparrow, DataChanneler, concurrent} from "sparrow-rtc"

  // define your own cable properties (default shown, available as StdCable)
  export type MyCable = {
    reliable: RTCDataChannel
    unreliable: RTCDataChannel
  }

  // define your own cable config (default shown)
  const myCableConfig = Sparrow.asCableConfig<MyCable>({
    offering: async peer => {
      return concurrent({
        reliable: DataChanneler.offering(peer, "reliable", {
          ordered: true,
        }),
        unreliable: DataChanneler.offering(peer, "unreliable", {
          ordered: false,
          maxRetransmits: 0,
        }),
      })
    },
    answering: async peer => {
      return concurrent({
        reliable: DataChanneler.answering(peer, "reliable"),
        unreliable: DataChanneler.answering(peer, "unreliable"),
      })
    },
  })
  ```
- You can then use your cable config for `Sparrow.host` and `Sparrow.join`
  ```ts
    //                    your custom cable type
    //                                 |
  const hosted = await Sparrow.host<MyCable>({
    ...myOtherOptions,

    // your custom cable config
    cableConfig: myCableConfig,
  })
  ```
- Note that Sparrow creates its own special utility rtc data channel called the `conduit`, which is reserved for sparrow internal functionality (it sends "bye" notifications when you call `connection.disconnect` to immediately notify the other side)

