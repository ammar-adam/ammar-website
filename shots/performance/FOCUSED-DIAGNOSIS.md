# Focused desktop follow-up

The single authorized follow-up used the same production server (localhost:3103), Chrome hardware ANGLE/Intel Arc 140V, and 1440×900 viewport. It ran one 16-second traversal, waited for data-warming=0, then sampled small scroll sweeps near .73, .80 and .94. Chrome closed in the harness finally block and the GPU lock was released.

| Measurement | Submitted post-pass FPS | Maximum interval | Frames over 50ms |
| --- | ---: | ---: | ---: |
| First traversal in this follow-up | 111.1 | 145.1ms | 10 |
| Concourse .73 | 120.0 | 15.0ms | 0 |
| Concourse .80 | 120.2 | 14.4ms | 0 |
| Gate .94 | 120.1 | 13.5ms | 0 |

All three focused samples had warming=0. There were no linkProgram calls after the first traversal and no browser errors. The prior severe late-concourse/gate slowdown did not reproduce after readiness. That is evidence against a persistent queue loop, shader-variant churn or permanent extra scene cost in the settled build; it is not proof of what caused the earlier run.

The earlier production-final desktop run still recorded a 1,882.8ms maximum first-traversal interval and a severe slowdown continuing into its immediate second traversal. These cold compilation/first-use stalls remain an unresolved performance limitation. A fresh browser context does not guarantee a cold graphics-driver shader cache. This follow-up came after other renders and therefore cannot establish first-visit cold performance. Data-warming=0 confirms the application's submitted shader queue has settled; it cannot certify every later driver-side pipeline operation or image upload is already warm.

Do not remove the queue or alter lighting based only on that anomalous earlier run. Preserve the cold report alongside this settled follow-up, and avoid claiming that all first-visit stalls are fixed. GPU timings/compositor presentation were not measured; these are the existing harness's post-pass CPU submission timestamps.

Raw evidence: focused-desktop.json. No source change was made during this investigation.
