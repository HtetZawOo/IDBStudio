let camera, scene, renderer;

// 🎯 gaze targets
let targetYaw = 0;
let targetPitch = 0;

// 🧊 smoothed velocity
let velocityYaw = 0;
let velocityPitch = 0;

// ⚙️ tuning (safe values)
const sensitivity = 0.5;
const deadZone = 0.1;
const smoothFactor = 0.05;
const rotationSpeed = 0.03;

init();
animate();

// ==========================
// 🎬 INIT SCENE
// ==========================
function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    1,
    1100
  );

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // 🌍 Panorama sphere
  const geometry = new THREE.SphereGeometry(500, 60, 40);
  geometry.scale(-1, 1, 1);

  const texture = new THREE.TextureLoader().load(
    "https://threejs.org/examples/textures/2294472375_24a3b8ef46_o.jpg"
  );

  const material = new THREE.MeshBasicMaterial({ map: texture });
  const mesh = new THREE.Mesh(geometry, material);

  scene.add(mesh);

  window.addEventListener("resize", onWindowResize);

  // 👁️ Start gaze tracking
  setupGaze();
}

// ==========================
// 👁️ GAZE TRACKING
// ==========================
function setupGaze() {
  GazeCloudAPI.OnResult = function (GazeData) {
    if (GazeData.state !== 0) return;

    let normX = GazeData.docX / window.innerWidth;
    let normY = GazeData.docY / window.innerHeight;

    let dx = normX - 0.5;
    let dy = normY - 0.5;

    // 🎯 dead zone (prevents jitter)
    if (Math.abs(dx) < deadZone) dx = 0;
    if (Math.abs(dy) < deadZone) dy = 0;

    // 🎮 treat as velocity, not position
    targetYaw = -dx * sensitivity;   // fixes left/right
    targetPitch = -dy * sensitivity;  // fixes up/down
  };

  GazeCloudAPI.StartEyeTracking();
}

// ==========================
// 🔄 ANIMATION LOOP
// ==========================
function animate() {
  requestAnimationFrame(animate);

  // 🧊 smooth motion
  velocityYaw += (targetYaw - velocityYaw) * smoothFactor;
  velocityPitch += (targetPitch - velocityPitch) * smoothFactor;

  // 🐢 slow rotation (comfortable)
  camera.rotation.y += velocityYaw * rotationSpeed;
  camera.rotation.x += velocityPitch * rotationSpeed;

  // ⛔ clamp vertical rotation
  camera.rotation.x = Math.max(
    -Math.PI / 2,
    Math.min(Math.PI / 2, camera.rotation.x)
  );

  renderer.render(scene, camera);
}

// ==========================
// 📱 RESIZE HANDLER
// ==========================
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}