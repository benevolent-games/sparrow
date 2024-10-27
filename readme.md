
# 🐦 sparrow-rtc

🌟 ***sparrow makes webrtc super easy.***  
🫂 webrtc is peer-to-peer networking between browser tabs.  
🎮 perfect for making player-hosted multiplayer web games.  
📽️ also capable of multimedia streaming.  
💖 free and open source.  

<br/>

## 🐦 hosting and joining

1. **install sparrow-rtc**
    ```sh
    npm i sparrow-rtc
    ```
1. **be a host: allow peers to join you**
    ```ts
    import {Sparrow} from "sparrow-rtc"

    const sparrow = await Sparrow.connect({
      joined: peer => {
        console.log("peer connected")
        peer.channels.unreliable.send("world")
        peer.channels.unreliable.onmessage = m => console.log(m.data)
        return () => console.log("peer disconnected")
      },
      closed: () => console.log("disconnected from sparrow"),
    })

    sparrow.invite
      // "8ab469956da27aff3825a3681b4f6452"
    ```
    - this creates a websocket connection to the sparrow signaling server
    - people can join using the `sparrow.invite` string
1. **be a client: connect to the host via the invite**
    ```ts
    import {Sparrow} from "sparrow-rtc"

    const sparrow = await Sparrow.connect({
      closed: () => console.log("disconnected from sparrow"),
    })

    const peer = await sparrow.join({
      invite: "8ab469956da27aff3825a3681b4f6452",
      closed: () => console.log("disconnected from peer"),
    })
    ```

<br/>

## 🐦 learn more about sparrow

- `Sparrow.host` and `Sparrow.join` both accept these common options
  ```ts
  import {CommonOptions} from "sparrow-rtc"

  const options: CommonOptions = {

    // defaults to use sparrow's free signaling server
    url: "wss://sparrow.benev.gg/",

    // defaults to using google's free stun/turn servers
    rtcConfig: stdRtcConfig(),

    // defaults to dual data channels, one reliable, one unreliable
    channelsConfig: stdDataChannels(),
  })
  ```

