# Read-only cold-intro diagnosis

Compared `shots/performance/production-baseline-phone-cold.json` with `production-final-phone-cold.json`; no additional GPU run.

| Event | Baseline | SSR discovery candidate |
|---|---:|---:|
| AV1 request | 4.694s | 0.776s |
| Metadata | 5.667s | 4.898s |
| First playing | 12.775s | 11.474s |
| First moving frame (>0.02s media) | about 12.793s | 11.501s |
| Buffer waits | 1 / 0.322s | 8 / 2.284s |
| End | 19.112s | 19.779s |
| First ready world draw | 27.641s | 28.440s |

The final AV1 request is aborted at 11.459s after 1,179,758 bytes. Playback starts at 11.474s with readyState 4 but networkState 1. A second request for the same AV1 begins at 11.475s and transfers another 1,188,953 bytes. Their total (2,368,711) is approximately the locked 2,369,867-byte film; the trace shows neither a codec replacement nor a full duplicate download. Only one loadstart occurs. The resumed transfer finishes at 19.325s. Playback first exhausts its reserve at media 3.189s and repeatedly waits for the second half.

This supports a native preload/range-buffer handoff and an overoptimistic can-play-through estimate, rather than a React source reset. The earlier request competes with initial CSS/JS/fonts/poster and only receives its response at 3.947s, so four seconds earlier discovery produces less than one second earlier metadata. World prefetch begins at 19.528s, after the AV1 body completes: it cannot explain these intro stalls. No long main-thread task is recorded during playback; these waits coincide with networkState 2 / readyState 2, consistent with starvation rather than shader compilation.

The eight waits total approximately 2.284s, versus 0.322s baseline. Therefore the candidate is an earlier-motion improvement, **not a smoothness improvement**, and its finish/world handoff is slower in this run. Caption/Skip DOM insertion at 0.782s is also distinct from first contentful paint at 2.120s.

## Recommendation

The smallest reliable release choice is to retain the measured original source-selection/autoplay policy if smoothness is the priority, while keeping the independent world/per-frame optimizations. This gives up the 1.3s first-motion gain but avoids shipping the observed eight-stall regression; it still does not meet the requested cold-start target or guarantee zero waits.

A stricter buffer gate could keep autoplay disabled until the buffered range covers the entire six-second film, then call play. It preserves bytes and codec choice but delays motion to full download and may wait indefinitely when a browser suspends preloading. Do **not** ship this untested as a one-line `canplaythrough` change: readyState 4 already occurred with only about half this film buffered. An unconditional `.play()` at `canplay` starts with still less reserve and is likely worse.

Guaranteed no-network-stall playback would require controlled full-file fetching before playback (for example a Blob), or smaller permitted media. The former is a larger change with memory/cache/cancellation tradeoffs and longer startup; the latter violates this pass's locked-media constraint. No tiny standards-based property change guarantees uninterrupted streaming of these bytes at the tested throughput.

Browser behavior references: [HTML media preload and autoplay](https://html.spec.whatwg.org/dev/media.html) describes preload as a hint, not a guaranteed full download; [Chromium buffering state handling](https://chromium.googlesource.com/chromium/src/+/95df2d2fe61cd128f5a8ad0318cd4e883d206f3e/media/blink/webmediaplayer_impl.cc) uses a can-play-through estimate and allows the data source to adjust buffer sizes/release network connections. The trace, not that source alone, supports the diagnosis above.
