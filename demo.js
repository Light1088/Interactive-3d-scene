/* Brian Tam — public adaptation of the interactions in my supplied app.ts.
 * Browser controls, scene setup and distance measurement using Babylon.js APIs.
 * No private school tests, grading scripts, team source or video assets included.
 */
"use strict";

function startInteractionPreview() {
  const oldCanvas = document.getElementById("renderCanvas");
  const canvas = oldCanvas.cloneNode(true);
  oldCanvas.replaceWith(canvas);
  const ctx = canvas.getContext("2d");
  const distance = document.getElementById("distance");
  const status = document.getElementById("status");
  const reset = document.getElementById("reset");
  const vr = document.getElementById("vr");
  document.getElementById("failure").style.display = "none";
  status.textContent = "2D interaction preview — 3D rendering is unavailable in this browser. Drag the blue ball, click it to enlarge it, or select Reset.";
  vr.disabled = true; vr.textContent = "VR needs 3D support";
  let ball = {x:-3,z:-1,scale:1}, down = null, width = 0, height = 0, unit = 1;
  function point(x,z) { return {x:width/2+x*unit,y:height/2+z*unit}; }
  function draw() {
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    width = rect.width; height = rect.height; unit = Math.min(width,height)/18;
    canvas.width = Math.round(width*ratio); canvas.height = Math.round(height*ratio);
    ctx.setTransform(ratio,0,0,ratio,0,0);
    ctx.fillStyle = "#142736"; ctx.fillRect(0,0,width,height);
    ctx.strokeStyle = "#284658"; ctx.lineWidth = 1;
    for(let n=-8;n<=8;n++){const a=point(n,-8),b=point(n,8),c=point(-8,n),d=point(8,n);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.moveTo(c.x,c.y);ctx.lineTo(d.x,d.y);ctx.stroke();}
    const target=point(3,3),p=point(ball.x,ball.z);
    ctx.setLineDash([6,5]);ctx.strokeStyle="#9cbac8";ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(target.x,target.y);ctx.stroke();ctx.setLineDash([]);
    ctx.fillStyle="#efad53";ctx.fillRect(target.x-unit*.6,target.y-unit*.6,unit*1.2,unit*1.2);
    ctx.fillStyle="#39b9ed";ctx.beginPath();ctx.arc(p.x,p.y,unit*.6*ball.scale,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#eef4fa";ctx.font="15px system-ui";ctx.fillText("Blue ball",p.x+unit*ball.scale,p.y);ctx.fillText("Reference",target.x+unit,target.y);
    const d=Math.hypot(ball.x-3,ball.z-3,.6*ball.scale);
    distance.textContent="Distance to reference origin: "+d.toFixed(2)+" scene units";
  }
  canvas.addEventListener("pointerdown", e=>{
    const r=canvas.getBoundingClientRect(),p=point(ball.x,ball.z),x=e.clientX-r.left,y=e.clientY-r.top;
    if(Math.hypot(x-p.x,y-p.y)<=Math.max(unit*.6*ball.scale,20)){
      down={id:e.pointerId,x,y,bx:ball.x,bz:ball.z,moved:false};canvas.setPointerCapture(e.pointerId);e.preventDefault();
    }
  });
  canvas.addEventListener("pointermove",e=>{
    if(!down||e.pointerId!==down.id)return;
    const r=canvas.getBoundingClientRect(),dx=e.clientX-r.left-down.x,dy=e.clientY-r.top-down.y;
    if(Math.hypot(dx,dy)>4)down.moved=true;
    if(down.moved){ball.x=Math.max(-7,Math.min(7,down.bx+dx/unit));ball.z=Math.max(-7,Math.min(7,down.bz+dy/unit));draw();}
  });
  canvas.addEventListener("pointerup",e=>{
    if(!down||e.pointerId!==down.id)return;
    if(!down.moved)ball.scale=Math.min(2.5,ball.scale*1.2);
    down=null;draw();
  });
  canvas.addEventListener("pointercancel",()=>{down=null;});
  reset.disabled=false;reset.onclick=()=>{ball={x:-3,z:-1,scale:1};draw();};
  window.addEventListener("resize",draw);draw();
}

(async function () {
  const status = document.getElementById("status");
  const failure = document.getElementById("failure");
  const distance = document.getElementById("distance");
  const reset = document.getElementById("reset");
  const vr = document.getElementById("vr");
  function fail(message) { failure.style.display = "block"; failure.textContent = message; }
  if (!window.BABYLON) { startInteractionPreview(); return; }
  try {
    const B = window.BABYLON;
    const canvas = document.getElementById("renderCanvas");
    const engine = new B.Engine(canvas, true);
    const scene = new B.Scene(engine);
    scene.clearColor = new B.Color4(0.055, 0.09, 0.15, 1);
    const camera = new B.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 3, 17, new B.Vector3(0, 0, 1), scene);
    camera.lowerRadiusLimit = 7; camera.upperRadiusLimit = 30;
    camera.upperBetaLimit = Math.PI / 2.1; camera.attachControl(canvas, true);
    new B.HemisphericLight("light", new B.Vector3(0.2, 1, 0.3), scene).intensity = 1.1;
    function material(name, color) { const m = new B.StandardMaterial(name, scene); m.diffuseColor = B.Color3.FromHexString(color); return m; }
    const ground = B.MeshBuilder.CreateGround("ground", {width: 16, height: 16}, scene);
    ground.material = material("groundMaterial", "#294353");
    const sphere = B.MeshBuilder.CreateSphere("sphere", {diameter: 1.2, segments: 24}, scene);
    sphere.position.set(-3, 0.6, -1); sphere.material = material("ballMaterial", "#39b9ed");
    const targetPosition = new B.Vector3(3, 0, 3);
    const marker = B.MeshBuilder.CreateBox("referenceMarker", {size: 1.4}, scene);
    marker.position.set(3, 0.7, 3); marker.material = material("markerMaterial", "#efad53"); marker.isPickable = false;
    sphere.actionManager = new B.ActionManager(scene);
    sphere.actionManager.registerAction(new B.ExecuteCodeAction(B.ActionManager.OnPickTrigger, () => {
      const scale = Math.min(2.5, sphere.scaling.x * 1.2); sphere.scaling.setAll(scale); sphere.position.y = 0.6 * scale;
    }));
    // A plane normal allows movement across the floor, unlike the original diagonal drag axis.
    const drag = new B.PointerDragBehavior({dragPlaneNormal: new B.Vector3(0, 1, 0)});
    drag.useObjectOrientationForDragging = false;
    drag.onDragStartObservable.add(() => camera.detachControl());
    drag.onDragObservable.add(() => {
      sphere.position.x = B.Scalar.Clamp(sphere.position.x, -7, 7);
      sphere.position.z = B.Scalar.Clamp(sphere.position.z, -7, 7);
    });
    drag.onDragEndObservable.add(() => camera.attachControl(canvas, true));
    sphere.addBehavior(drag);
    scene.onBeforeRenderObservable.add(() => {
      const d = B.Vector3.Distance(sphere.position, targetPosition);
      distance.textContent = `Distance to reference origin: ${d.toFixed(2)} scene units`;
    });
    reset.disabled = false;
    reset.onclick = () => { sphere.scaling.setAll(1); sphere.position.set(-3, 0.6, -1); camera.alpha = -Math.PI / 2; camera.beta = Math.PI / 3; camera.radius = 17; };
    engine.runRenderLoop(() => scene.render());
    window.addEventListener("resize", () => engine.resize());
    status.textContent = "Scene ready. Loading the dragon model; the gold box marks its reference origin.";
    // Expose scene objects only to allow repeatable browser verification of this portfolio demo.
    window.portfolioDemo = {scene, sphere, marker, targetPosition, camera};
    const modelUrl = "https://raw.githubusercontent.com/BabylonJS/Assets/master/meshes/Georgia-Tech-Dragon/dragon.glb";
    const importModel = B.SceneLoader.ImportMeshAsync("", "", modelUrl, scene);
    let modelStatus = "marker";
    importModel.then(result => {
      const root = result.meshes[0]; root.name = "dragon";
      root.scaling.setAll(1); root.position.setAll(0); root.computeWorldMatrix(true);
      const bounds = root.getHierarchyBoundingVectors(true);
      const span = bounds.max.subtract(bounds.min); const size = Math.max(span.x, span.y, span.z);
      if (size > 0) root.scaling.setAll(3 / size);
      root.computeWorldMatrix(true);
      const scaled = root.getHierarchyBoundingVectors(true);
      root.position.set(targetPosition.x - (scaled.min.x + scaled.max.x)/2, -scaled.min.y, targetPosition.z - (scaled.min.z + scaled.max.z)/2);
      result.meshes.forEach(mesh => {mesh.isPickable = false;});
      marker.setEnabled(false); modelStatus = "loaded";
      status.textContent = "Dragon loaded. Drag or click the blue ball; distance is measured to the dragon's reference origin.";
    }).catch(() => { modelStatus = "failed"; status.textContent = "Dragon unavailable. Use the gold reference box instead; interactions and distance measurement still work."; });
    setTimeout(() => {if(modelStatus === "marker") status.textContent = "Dragon is still loading. You can use the gold reference box in the meantime.";}, 12000);
    vr.disabled = false;
    vr.onclick = async () => {
      vr.disabled = true;
      try {
        if (!navigator.xr || !await navigator.xr.isSessionSupported("immersive-vr")) { vr.textContent = "VR unavailable on this device"; return; }
        await scene.createDefaultXRExperienceAsync({floorMeshes: [ground],uiOptions: {sessionMode: "immersive-vr"},teleportationOptions: {timeToTeleport: 2000,floorMeshes: [ground]}});
        vr.textContent = "Use the headset button to enter VR";
      } catch (e) { vr.textContent = "VR could not initialise"; }
    };
  } catch (e) { startInteractionPreview(); }
})();
