
![](https://i.imgur.com/p0EFnnU.png)

# 🐦 Sparrow RTC

🌟 ***Sparrow makes WebRTC easy.***  
🫂 WebRTC is peer-to-peer networking between browser tabs.  
🎮 Perfect for making player-hosted multiplayer web games.  
🚦 *Signaller* is a free service that negotiates connections.    
🚀 Try the demo at [**https://sparrow.benev.gg/**](https://sparrow.benev.gg/)  
💪 Self-hostable, read [self-hosting.md](./self-hosting.md) for instructions.  
💖 Free and open source.  

<br/>

## 🐦 Connecting peers together

> **The Objective:**  
> Connect two players together, and establish [RTC Data Channels](https://developer.mozilla.org/en-US/docs/Web/API/RTCDataChannel) between them, so you can make a player-hosted multiplayer video game.

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
      welcome: prospect => connection => {
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

## 🐦 Get the Cable!

- The `cable` is what you want. The cable is what you need.
- The default cable that sparrow gives you has two [RTC Data Channels](https://developer.mozilla.org/en-US/docs/Web/API/RTCDataChannel).
  - **`cable.reliable` — Steadfast orderly delivery of your messages. *(TCP-like)***
    - Every message is accounted for. Guaranteed to have no losses (unless a disconnect occurs).
    - When a message goes missing — massive catastrophic lag spike, everything halts until the missing message is successfully retransmitted.
    - Ideal for important game events like "this player picked up this inventory item" or something like that.
  - **`cable.unreliable` — Chaotic shouting of your messages toward the other side. *(UDP-like)***
    - Not every message will arrive. There will be losses.
    - When a message goes missing — it's ignored, and everything continues like nothing happened.
    - Ideal for "continuous data" like "now this player is located here" 30 times per second.

<br/>

## 🐦 Custom URLs

- `Sparrow.host` and `Sparrow.join` both accept these common options
  ```ts
  import {Sparrow} from "sparrow-rtc"

  const hosted = await Sparrow.host({
    ...myOtherOptions,

    // sparrow's official signaller instance (default shown)
    url: "wss://signaller.sparrow.benev.gg/",

    // choose which stun and/or turn servers to use (default shown)
    rtcConfigurator: async() => ({
      iceServers: [

        // these are free publicly available STUN servers
        {urls: ["stun:stun.l.google.com:19302"]},
        {urls: ["stun:stun.services.mozilla.com:3478"]},
        {urls: ["stun:server2024.stunprotocol.org:3478"]},

        // if you pay for a TURN service,
        // you'll obtain some config data that goes in this same array
        // as these STUN servers above.
      ],
    }),
  })
  ```

<br/>

## 🐦 Understanding Sparrow's *Signaller* Service
- We host a free official Sparrow signaller for everybody:
  - `https://signaller.sparrow.benev.gg/`
  - https://signaller.sparrow.benev.gg/health — shows a timestamp if the signaller is up and running
- The Sparrow Signaller does two main things:
  - It helps users find each other via invite links.
  - It [negotiates](./s/negotiation/negotiate-rtc-connection.ts) a [complex exchange](./s/negotiation/utils/attempt-rtc-connection.ts) of WebRTC information, to establish connections between users.
- You can [self-host](./self-hosting.md) your own instance.

<br/>

## 🐦 Understanding STUN Servers

- To allow users to connect to each other, they need to know each other's IP addresses.
- WebRTC usees STUN servers to discover the user IP addresses.
- STUN servers are efficient and cheap to operate, and so there are many publicly available free STUN servers you can use.
- By default, Sparrow will use stun servers by `google.com`, `mozilla.com`, and `stunprotocol.org`.

<br/>

## 🐦 Understanding TURN Servers

- Sometimes users are under network conditions that makes direct connections impossible.
  - This happens because the internet is badly designed.
- To save the day, you can configure a TURN server which will act as a reliable relay.
  - On the up side, with a TURN service, your users can basically always connect reliably.
  - On the down side, your users will have an increased ping time, and this *costs you money* because you have to pay for all their relayed traffic bandwidth.
  - Sparrow does not offer TURN service for free, you'd need to configure your own.
  - You can run your own TURN server, like [coturn](https://github.com/coturn/coturn), or you can use a paid cloud service provider like [Cloudflare Calls TURN service](https://developers.cloudflare.com/calls/turn/).
  - For some reason these are all a total pain to setup properly.
- Sparrow's signaller has a little cloudflare integration for my own personal convenience, but you have to [self-host](./self-hosting.md) the signaller and follow the cloudflare instructions there.

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
- Note that Sparrow creates its own special utility rtc data channel called the `conduit`, which is reserved for sparrow internal functionality (it sends "bye" notifications when you call `connection.disconnect()` to immediately notify the other side)

<br/>

## 🐦 Logging

- You can specify to only log errors like this
  ```ts
  const joined = await Sparrow.join({
    invite: "8ab469956da27aff3825a3681b4f6452",
    disconnected: () => console.log(`disconnected from host`),

    // only log errors
    logging: Sparrow.errorLogging,
  })
  ```
- Of course you can set this `logging` option on `Sparrow.host` as well
- Three available settings are:
  - `Sparrow.stdLogging` -- log everything (default)
  - `Sparrow.errorLogging` -- only log errors
  - `Sparrow.noLogging` -- log nothing at all

