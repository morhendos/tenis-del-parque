# Tennis Umpire — Hardware Strategy & Product Vision

## The Problem

The Tennis Umpire app currently uses Flic2 Bluetooth buttons for point registration. Each player carries their own button and registers their own points during the match — there is no umpire.

Flic2 buttons use Bluetooth Low Energy (BLE), which operates on the congested 2.4GHz band. Modern tennis courts are surrounded by BLE noise: smartwatches, wireless earbuds, fitness trackers, phones constantly scanning for devices. BLE has only 40 channels (3 for advertising), so packet collisions and dropped connections become increasingly common as nearby device density grows.

The result: missed button presses during matches. The button works mechanically, but the radio signal gets lost in congestion. For a self-scoring system where both players depend on reliable input, this is a dealbreaker.

**Key constraint:** The app requires three distinct input events per button — single press, double press, and press-and-hold — which means BLE optimizations like disabling click disambiguation are not an option.

---

## The Solution: Phone Hotspot + WiFi Architecture

### Core Insight

Instead of fighting Bluetooth congestion, bypass it entirely. One phone acts as the central scoring device and creates a **WiFi hotspot**. Input devices connect to this private network and communicate over HTTP or WebSocket — no Bluetooth required.

This eliminates every Bluetooth problem at once:

- **No BLE congestion** — communication happens over WiFi, a completely different protocol with far better congestion handling
- **No pairing headaches** — devices join the hotspot like any WiFi network
- **No infrastructure dependency** — the hotspot is created by the phone itself, works anywhere (outdoor courts, parks, no existing WiFi needed)
- **Minimal network congestion** — a private hotspot with 2-3 devices has essentially zero contention
- **Strong signal** — the phone is at most 10-15 meters from any device on court

### How It Works

```
[Player A: Wrist Device] ── WiFi ──┐
                                    │
                             [Central Phone]
                             - WiFi Hotspot
                                    │    - Scoring App
[Player B: Wrist Device] ── WiFi ──┘    - Local HTTP Server
                                         - Voice Announcements
```

1. One player (or a third party) places their phone courtside and enables hotspot mode
2. The app starts a local HTTP/WebSocket server
3. Each player connects their wrist-worn input device to the hotspot
4. Button presses / taps are sent as HTTP requests to the central phone
5. The central phone processes the score and announces via voice

### Hybrid Mode: Flic2 Backward Compatibility

Flic2 buttons can still be used alongside WiFi devices. The central phone sits courtside and one player's Flic connects to it directly via BLE. Since the central phone is a dedicated scoring device (not the player's personal phone cluttered with earbuds and watch connections), the BLE environment is cleaner and more reliable.

```
[Player A: Flic2] ─── BLE ────┐
                                │
                         [Central Phone]
                         - WiFi Hotspot
                                │    - Scoring App
[Player B: Apple Watch] ─ WiFi ┘    - Local HTTP Server
                                     - Voice Announcements
```

Existing Flic owners aren't left behind — they can keep using their button while the other player uses a WiFi device. Over time, as players adopt smartwatches or purchase our own hardware, Flic naturally phases out.

---

## Product Line

### Tennis Umpire Watch (Custom Branded Smartwatch)

A dedicated tennis scoring wearable — a white-label smartwatch sourced from a manufacturer, branded with Tennis Umpire identity, preloaded with our scoring app as the sole application. Color touchscreen, WiFi connectivity, wrist strap.

This is not a general-purpose smartwatch competing with Apple Watch. It's a **purpose-built tennis scoring device** — similar to how padel brands sell dedicated electronic scoreboards.

**Specs:**
- Color touchscreen (basic, not AMOLED — keeps cost down)
- WiFi chip (2.4GHz 802.11 b/g/n)
- Physical side button(s) for tactile input alongside touch
- Rechargeable battery (target: 4+ hours active use per charge)
- Splash/sweat resistant (IPX4 minimum)
- Tennis Umpire branding on face and strap

**Gesture mapping:**
- Screen tap → single press event
- Double tap → double press event
- Long press → hold event
- (Or physical side button with same gesture logic)

**Manufacturing:**
- White-label smartwatch manufacturers in Shenzhen (widely available on Alibaba)
- Custom firmware with our app preloaded
- Minimum order quantities typically 500-1000 units
- Component cost estimate: €15-30 per unit at modest volumes

**Pros:**
- Completely removes the "does the player own a smartwatch" question
- Full control over the hardware, software, and user experience
- No App Store dependency — it's our device, our firmware
- Strong branding opportunity — the device IS the product
- Players associate the physical product with the Tennis Umpire brand

**Cons:**
- Upfront manufacturing investment
- Inventory management and shipping logistics
- Hardware warranty and support obligations
- Firmware development and maintenance
- Longer lead time to market than a software-only solution

---

### Tennis Umpire Button (Custom WiFi Wrist Button)

A small ESP32-based wrist-worn button. Physical click only — no screen. Connects to the hotspot WiFi and sends HTTP requests. Our own replacement for Flic2, but over WiFi instead of BLE.

**Specs:**
- Single physical button with satisfying tactile click
- ESP32 WiFi microcontroller
- Small lightweight enclosure, wrist strap or clip-on
- Rechargeable battery
- LED indicator for connection status
- Firmware handles click, double-click, and hold detection

**Manufacturing:**
- Simpler than the watch — fewer components, no screen
- PCB design + 3D printed or injection molded enclosure
- Component cost estimate: €5-15 per unit

**Pros:**
- Cheapest option for players who don't own a smartwatch
- Physical tactile button — eyes-free operation
- WiFi-based — no BLE congestion issues
- Simple and reliable — fewer things to go wrong than a touchscreen device

**Cons:**
- Another device to charge
- No visual feedback (no screen) — relies on LED or haptic confirmation
- Firmware development required (Arduino/C++ on ESP32)
- Less premium feel than the watch

---

### Apple Watch App (Native watchOS)

A free native watchOS app for players who already own an Apple Watch. Connects to the central phone over the hotspot WiFi. Minimal UI — large tap zones or Digital Crown input.

**Gesture mapping:**
- Single tap → single press event
- Double tap → double press event
- Long press → hold event

**Pros:**
- Large installed base in the target demographic (Sotogrande/Marbella)
- No extra device to carry — already on their wrist
- Turns the device that was causing BLE interference into the solution
- Free app acts as a marketing funnel (see Product Tiers below)

**Cons:**
- Requires native Swift/SwiftUI development
- Apple-only ecosystem
- App Store review process

**Development effort:** Medium. A minimal watchOS app with three gesture types and HTTP requests is straightforward in SwiftUI.

---

### Wear OS Watch App

Same concept as the Apple Watch app but for Android/Wear OS ecosystem (Samsung Galaxy Watch, Pixel Watch).

**Pros:**
- Covers the Android watch market
- Same wrist-based convenience

**Cons:**
- Requires separate Kotlin/Java development
- Smaller market share in the target demographic
- More fragmented device ecosystem

**Development effort:** Medium. Only worth pursuing if there's meaningful player demand.

---

### Flic2 Button (Legacy — BLE)

The current solution. Supported for backward compatibility when connected directly to the central phone via BLE.

**Role going forward:** Transitional. Not actively promoted but still functional. The cleaner BLE environment of a dedicated central phone helps reliability. Will naturally phase out as players adopt WiFi alternatives.

---

## Product Tiers & Sales Strategy

### Premium Kit — €99-129
Two Tennis Umpire Watches in a branded box. Everything needed for two players to score a match. Unbox, charge, connect to the central phone hotspot, play. No smartwatch required, no app store, no setup complexity.

### Budget Kit — €49-69
Two Tennis Umpire Buttons in a branded box. Same functionality, no screen. For players who want a physical button and don't care about visual feedback on their wrist.

### Mixed / BYOD — Free app + single device purchase
Player already owns an Apple Watch (or Wear OS watch), downloads the free app. Their opponent doesn't have a smartwatch, so they buy a single Tennis Umpire Button for €29-39.

### Marketing Flywheel
The free smartwatch app is the entry point. Every Apple Watch user who tries it becomes an evangelist who then needs their opponents to have an input device too. The cheapest way to onboard an opponent is selling them a €29 button. The app drives hardware sales, the hardware drives app adoption.

---

## Courtside Scorekeeper Mode (Web Browser)

For situations where a third party is keeping score — a friend, a coach, a parent watching a junior match — the central phone can serve a simple web page over the hotspot. The scorekeeper opens this page on their own phone or tablet and taps to register points for each player.

This is **not a player input method** — players are actively playing tennis and cannot carry a phone in hand. It's a spectator/scorekeeper tool for coached sessions, junior matches, or matches where someone courtside is willing to keep score.

**Development effort:** Low. A simple web page with WebSocket connection and two sets of tap targets.

---

## Recommended Development Phases

### Phase 1: Hotspot Server + Apple Watch App
Build the local HTTP/WebSocket server in the central phone app. Simultaneously develop the Apple Watch app as the first WiFi input device. Flic2 continues to work alongside it via BLE. This validates the entire WiFi architecture with real players on real courts.

### Phase 2: Courtside Scorekeeper Web Remote
Add the browser-based interface for third-party scorekeepers. Low effort, broadens the use cases.

### Phase 3: Custom Hardware — Tennis Umpire Button (ESP32)
Design and prototype the custom WiFi wrist button. Start with 3D-printed enclosures and hand-assembled units for beta testing. Once validated, move to manufactured production runs.

### Phase 4: Custom Hardware — Tennis Umpire Watch
Source white-label smartwatch hardware. Develop custom firmware. Produce initial run of branded devices. This is the premium product offering.

### Phase 5: Wear OS App (if demand warrants)
Only if Android watch users represent a meaningful portion of the player base.

---

## Technical Requirements for the Central Phone App

Regardless of which input devices are used, the central phone app needs:

1. **Hotspot detection/guidance** — detect if hotspot is active, guide user to enable it
2. **Local HTTP server** — lightweight server running within the app
3. **WebSocket support** — for real-time, low-latency communication
4. **Device registration** — when a player connects, they identify as Player A or Player B
5. **Input normalization** — all devices (WiFi and BLE) produce the same event format: `{ player_id, event_type: click | double_click | hold, timestamp }`
6. **Multi-protocol support** — accept input from BLE (Flic2) and WiFi (watches, buttons, web remote) simultaneously
7. **Connection monitoring** — show which players are connected and via which method (BLE/WiFi), alert if a device drops
8. **Latency compensation** — timestamp events on the sending device to handle any network delay (on a local hotspot this should be under 10ms)

---

## Input Compatibility Matrix

| Player A | Player B | Connections |
|----------|----------|-------------|
| Tennis Umpire Watch | Tennis Umpire Watch | Both WiFi |
| Tennis Umpire Watch | Apple Watch app | Both WiFi |
| Tennis Umpire Watch | Tennis Umpire Button | Both WiFi |
| Tennis Umpire Button | Tennis Umpire Button | Both WiFi |
| Apple Watch app | Apple Watch app | Both WiFi |
| Apple Watch app | Tennis Umpire Button | Both WiFi |
| Flic2 button | Apple Watch app | BLE + WiFi |
| Flic2 button | Tennis Umpire Watch | BLE + WiFi |
| Flic2 button | Tennis Umpire Button | BLE + WiFi |
| Flic2 button | Flic2 button | Both BLE (legacy) |
