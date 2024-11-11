
![](https://i.imgur.com/p0EFnnU.png)

# 🐦 Sparrow-RTC

🌟 ***Sparrow makes WebRTC easy.***  
🚀 Try the demo at [**https://sparrow.benev.gg/**](https://sparrow.benev.gg/)  
🤝 WebRTC is peer-to-peer networking between browser tabs.  
🎮 Perfect for making player-hosted multiplayer web games.  
💪 Self-hostable, read [self-hosting.md](./self-hosting.md) for instructions.  
💖 Free and open source.  

<br/>

## 🫂 Connecting peers together

> **The Objective:**  
> Connect two players together, and establish [RTC Data Channels](https://developer.mozilla.org/en-US/docs/Web/API/RTCDataChannel) between them.

1. **Install `sparrow-rtc`**
    ```sh
    npm i sparrow-rtc
    ```
1. **Host a session**
    ```ts
    import Sparrow from "sparrow-rtc"

    const sparrow = await Sparrow.host({

      // accept people joining, send/receive some data
      welcome: prospect => connection => {
        console.log(`peer connected: ${connection.id}`)
        connection.cable.reliable.send("hello")
        connection.cable.reliable.onmessage = e => console.log("received", m.data)
        return () => console.log(`peer disconnected: ${connection.id}`)
      },

      // lost connection to the sparrow signaller
      close: () => console.warn(`connection to sparrow signaller has died`),
    })

    // anybody with this invite code can join
    sparrow.invite
      // "215fe776f758bc44"
    ```
1. **Join that session**
    ```ts
    import Sparrow from "sparrow-rtc"

    const sparrow = await Sparrow.join({
      invite: "215fe776f758bc44",
      disconnected: () => console.log(`disconnected from host`),
    })

    // send and receive data
    sparrow.connection.cable.reliable.send("world")
    sparrow.connection.cable.reliable.onmessage = m => console.log("received", m.data)
    ```

<br/>

## 🔌 Get the Cable!
- The `cable` is what you want. *The cable is what you need.*
- The default cable that sparrow gives you has two [RTC Data Channels](https://developer.mozilla.org/en-US/docs/Web/API/RTCDataChannel).
- Each data channel has a `channel.send(data)` method, so you can send data.
- Each data channel has a `channel.onmessage = event => {}` function, so you can receive messages.

### 🦸 `cable.reliable` — orderly message delivery
- Every message is accounted for. Guaranteed to have no losses (unless a disconnect occurs).
- When a message goes missing — massive catastrophic lag spike, everything halts until the missing message is successfully retransmitted.
- Ideal for important game events like *"this player picked up this inventory item"* or something like that.

### 🦹 `cable.unreliable` — chaotic shouting message shouting
- Not every message will arrive. There will be losses.
- When a message goes missing — it's ignored, and everything continues like nothing happened.
- Ideal for *"continuous data"* like *"now this player is located here"* 30 times per second.

<br/>

## 🚪 Knock knock, who's there?
- Even when they have your invite code, a user must knock before they can connect.
- The default, is to allow everybody who knocks, like this:
  ```js
  const sparrow = await Sparrow.host({

    // allow everybody
    allow: async() => true,
  })
  ```
- Each user has a `reputation` which is a salted hash of their IP address -- making it easy for you to setup a ban list:
  ```js
  const myBanList = new Set()
    .add("a332f6646c65f738")
    .add("0d506addf169c407")

  const sparrow = await Sparrow.host({

    // allow people who are not banned
    allow: async({reputation}) => {
      return !myBanList.has(reputation)
    },
  })
  ```
- Hosts can use `allow` to ban unwanted joiners, but conversely, joiners can ban unwanted hosts:
  ```ts
  const sparrow = await Sparrow.join({

    // i want to join this invite i found
    invite: "215fe776f758bc44",

    // but not if it's this creep!
    allow: async({reputation}) => reputation !== "a332f6646c65f738",
  })
  ```
- You can also use the allow function as a global switch, to just close the door and prevent any more joiners:
  ```ts
  let doorIsOpen = true

  const sparrow = await Sparrow.host({
    allow: async() => doorIsOpen,
  })

  // Close the door!
  doorIsOpen = false
  ```
- And it's async, in case you want to consult your own remote service or something.

<br/>

## 👥 How to deal with people
- Okay, so you can pass this kind of `welcome` function to `Sparrow.host`. Here's some notes about the connection object you'll get:
  ```ts
  const sparrow = await Sparrow.host({
    welcome: prospect => connection => {

      // ephemeral id
      connection.id

      // persistent id (based on ip address)
      connection.reputation

      // RTCPeerConnection (webrtc internals)
      connection.peer

      // the cable you need
      connection.cable

      // destroy this connection
      connection.disconnect()

      // react to the other side disconnecting
      return () => {}
    },
  })
  ```
  - Note, you can also pass a `welcome` function like this to `Sparrow.join`, but, you don't have to..
- You can gather some useful connectivity data for each connection with this helper function:
  ```ts
  const report = await Sparrow.reportConnectivity(connection.peer)

  report.kind
    // "local" -- connected directly over local area network
    // "direct" -- connected directly over the internet
    // "relay" -- connected via indirect proxy TURN server

  report.bytesSent
    // number of bytes sent

  report.bytesSent
    // number of bytes received
  ```
- Optionally, you can react to `prospect`, which is an ongoing connection attempt:
  ```ts
  const sparrow = await Sparrow.host({
    welcome: prospect => {
      console.log(`${prospect.id} is attempting to connect..`)

      // ephemeral id
      prospect.id

      // persistent id (based on ip address)
      prospect.reputation

      // RTCPeerConnection (webrtc internals)
      prospect.peer

      // react to connection failure
      prospect.onFailed(() => {
        console.log(`${prospect.id} failed to connect`)
      })

      // react to successful connection
      return connection => {
        console.log(`${prospect.id} successfully connected`)

        // react to disconnected
        return () => {}
      }
    },
  })
  ```
  - This isn't necessary, you can just ignore prospects and only concern yourself with connections.
  - Prospects are an opportunity for you to display the activity of attempted connections as they're in progress.

<br/>

## 🔗 Custom URLs

- `Sparrow.host` and `Sparrow.join` both accept these common options
  ```ts
  import {Sparrow} from "sparrow-rtc"

  const sparrow = await Sparrow.host({
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

## 🚦 Understanding Sparrow's *Signaller* Service
- We host a free official Sparrow signaller for everybody:
  - `https://signaller.sparrow.benev.gg/`
  - https://signaller.sparrow.benev.gg/health — shows a timestamp if the signaller is up and running
- The Sparrow Signaller does two main things:
  - It helps users find each other via invite links.
  - It [negotiates](./s/negotiation/negotiate-rtc-connection.ts) a [complex exchange](./s/negotiation/utils/attempt-rtc-connection.ts) of WebRTC information, to establish connections between users.
- You can [self-host](./self-hosting.md) your own instance.

<br/>

## ⚡ Understanding STUN Servers
- To allow users to connect to each other, they need to know each other's IP addresses.
- WebRTC usees STUN servers to discover the user IP addresses.
- STUN servers are efficient and cheap to operate, and so there are many publicly available free STUN servers you can use.
- By default, Sparrow will use stun servers by `google.com`, `mozilla.com`, and `stunprotocol.org`.

<br/>

## 💈 Understanding TURN Servers
- Sometimes users are under network conditions that makes direct connections impossible.
  - This happens because the internet is badly designed.
- To save the day, you can configure a TURN server which will act as a reliable relay for those who are unable to achieve direct connections.
  - On the up side, with a TURN service, your users can basically always connect reliably.
  - On the down side, this *costs you money,* because you have to pay for all the relayed traffic bandwidth.
  - Sparrow does not offer TURN service for free, you'd need to configure your own.
  - You can run your own TURN server, like [coturn](https://github.com/coturn/coturn), or you can use a paid cloud service provider like [Cloudflare's](https://developers.cloudflare.com/calls/turn/).
  - For some reason these are all a total pain to setup properly.
- To use a TURN server, you just need to include the URL for it in your rtcConfigurator's `iceServers`.
- Sparrow's signaller does have a little cloudflare integration for my own personal convenience, which you can also take advantage of, but you'd have to [self-host](./self-hosting.md) the signaller and follow the cloudflare instructions there, to wire it up to your own cloudflare account -- however, you might instead consider spinning up your own coturn TURN server and continue to use the sparrow signaller for free -- either strategy would be a perfectly valid approach.

<br/>

## 🔌 Custom Cables
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
  const sparrow = await Sparrow.host<MyCable>({
    ...myOtherOptions,

    // your custom cable config
    cableConfig: myCableConfig,
  })
  ```
- Note that Sparrow creates its own special utility rtc data channel called the `conduit`, which is reserved for sparrow internal functionality (it sends "bye" notifications when you call `connection.disconnect()` to immediately notify the other side)

<br/>

## 📜 Logging
- You can specify to only log errors like this
  ```ts
  const sparrow = await Sparrow.join({
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

<br/>

## 💖 Free and open source
- Gimme a star on github!
- Join our [Benevolent Discord Community](https://discord.gg/BnZx2utdev), shout at `Chase` and say sparrow-rtc is rad!

