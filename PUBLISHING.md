# Publish the browser demo
1. Open this repository's Settings.
2. Select Pages in the left sidebar.
3. Under Build and deployment, set Source to Deploy from a branch.
4. Select main and /(root), then Save.
5. Wait for GitHub to display the published site address, then open it.

No build tools or local installation are required. GitHub Pages serves index.html and demo.js directly.

## Quick checks after publishing
- The blue ball and gold reference box appear.
- The dragon replaces the box when its external model loads.
- Clicking the ball enlarges it.
- Dragging changes its position and the distance display.
- Reset restores the initial ball position and scale.
- On an ordinary desktop, Check VR support should report whether immersive VR is available.

JavaScript syntax was checked before upload. Automated local browser testing was blocked by the execution environment, so browser interaction and headset verification remain pending. The original assignment's tests have not been reproduced.

## What changed for the public version
Converted the supplied TypeScript scene logic into a plain JavaScript page; added camera framing, instructions and Reset; changed diagonal-axis dragging to floor-plane dragging; used an HTML distance label; added model-load fallback and an explicit VR-support check. The unavailable video was omitted.

This is a portfolio adaptation, not a claim that these changes were part of the original graded assignment. Babylon.js and its loader are fetched from the official CDN. The dragon is loaded from the Babylon.js Assets repository.
