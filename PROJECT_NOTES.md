# Interactive 3D Scene — Development Notes
**Brian Tam · Individual coursework · TypeScript, Babylon.js and WebXR**

## Goal
Build a browser-based 3D scene where user actions change an object and the interface shows the updated distance to another model.

## What I implemented
- Camera controls, lighting, a ball, a plane and ground.
- An imported dragon model with adjusted position and scale.
- Click-to-enlarge and pointer-drag behaviour for the ball.
- A distance label updated from object positions before each rendered frame.
- A VideoDome configured for a looping 360° video.
- Immersive-VR setup with ground teleportation and a two-second teleport setting.

## Implementation choices
I attached the click handler and drag behaviour to the ball. The distance display uses the current positions each frame, so it can respond to movement. The code catches unavailable WebXR support and checks for a canvas before attaching camera controls.

## Testing and browser demo status
The submitted code shows these implementations. Browser recordings, automated-test results and headset-test results have not been included in this showcase.

Code review identified a mismatch between a comment and the drag setting: the specified diagonal axis does not provide unrestricted movement across the floor. Video playback also depends on the video file and browser autoplay settings, while the model loads from an external URL.

A public browser adaptation is now included as index.html and demo.js. It adds instructions, Reset, floor-plane dragging, model fallback and a VR support check. The original video is omitted. JavaScript syntax was checked; local browser testing was blocked by the execution environment. Runtime and headset verification remain pending. See PUBLISHING.md to activate GitHub Pages.

## Credits
- Coursework: IPA 1, CSD3121 — Developing Immersive Applications.
- Babylon.js: graphics, GUI and WebXR APIs.
- Dragon: external Babylon.js sample model.

[Back to project overview](README.md)
