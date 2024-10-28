
- env variable as the reputation salt (github secret) so it's fixed, and bans are more persistent
- possible renames
  - `Sparrow`
  - `Goose`
  - `Operation`
  - `Peer`
  - `Cable`
  - thusly,
    ```js
    joined: peer => {
      peer.connection // RTCPeerConnection
      peer.cable // formerly "channels"
    },
    ```

-----------------------

## a fresh approach

- sparrow gets trimmed down.
  - sparrow is *not* your app's server browser
  - it does not have an auth system
  - it doesn't tell you the users' names in the room you're in
  - it's *use-case agnostic* -- sparrow doesn't care
  - sparrow *negotiates connections*, and *nothing else*
- concept of rooms are replaced by mere "invites"
  - we no longer track who's in what rooms
  - no host migrations
  - joiners can disconnect from signaling as soon as they've successfully joined an invite
  - hosts stay connected to continue to receive new joiners
  - stats we track include "active hosts", and "hourly connections" and "daily connections"

---------------------------

- [x] operationalize rtc negotiation!
  - concurrent rtc negotiations will get scrambled until we split the process into sessions
- [ ] problem: feature creep with rooms, members, names, etc?
  - the original sparrow was more hands-off in terms of these details
  - we need a better story about how sparrow integrates with your own app
  - is sparrow meant to serve as your app/game's server browser functionality?
  - or should sparrow be more minimalistic and just mediate connections?
  - i'm kinda liking a minimalistic hands-off approach -- 'persons' don't even need names?
  - **a new idea**
    - there are no persistent ids
    - rooms can be created, and have an ephemeral id
    - the host gets a temporary seat id, that identifies them in that session
    - each joiner also gets a temporary seat id
    - all these ids are ephemeral and are unique to the room
- [ ] isolation by origin *and* by room tags
  - by default browser clients can only interact with other browser clients who are on the same origin
  - in the future we could figure a secure opt-in for multi-origin systems
  - separate stats for global sparrow usage, and your local app origin's usage
  - consider publicly listing top ten origins by usage load
- [ ] salt-and-hash user ip addresses as anonymized identifiers, useful for hosts to commit bans
  - maybe we hash the ip, plus a random salt value, plus the room id -- that way the bannable ids are not even recognizable between rooms
  - eg, you can ban somebody from your room -- but it's only valid or usable for that particular room instance
- [ ] implement operation and negotiation timeouts
- [ ] make working demos
- [ ] finish readme
- [ ] deployment
- [ ] make quick multimedia streaming demo

