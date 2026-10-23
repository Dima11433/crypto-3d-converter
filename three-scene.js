/**
 * 3D Engine for Crypto Converter & Hero Banner
 * Powered by Three.js
 * Implements 1:1 Visual Aesthetic from monacodesign:
 * - Floating glossy purple glass spheres with Ethereum crystal cores
 * - Interactive 3D token inspection stage with material switching
 * - Mouse parallax & smooth physics
 */

// Global 3D Manager
window.ThreeApp = (function () {
  let heroRenderer, heroScene, heroCamera;
  let stageRenderer, stageScene, stageCamera;
  let stageMeshGroup, heroOrbsGroup;
  let currentMaterialType = 'crystal';
  let currentTokenCode = 'ETH';

  // Parallax mouse variables
  let mouseX = 0;
  let mouseY = 0;
  let targetMouseX = 0;
  let targetMouseY = 0;

  // Stage orbit interaction variables
  let isDraggingStage = false;
  let previousMousePosition = { x: 0, y: 0 };
  let stageRotationVelocity = { x: 0, y: 0.008 };

  // Materials Cache
  const materials = {
    crystal: new THREE.MeshPhysicalMaterial({
      color: 0xba68c8,
      emissive: 0x4a154b,
      emissiveIntensity: 0.35,
      metalness: 0.15,
      roughness: 0.12,
      transmission: 0.65,
      ior: 1.6,
      reflectivity: 0.9,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      transparent: true,
      opacity: 0.95
    }),
    gold: new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.92,
      roughness: 0.18,
      emissive: 0x3d2b00,
      emissiveIntensity: 0.2
    }),
    cyber: new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      metalness: 0.98,
      roughness: 0.08,
      emissive: 0x7c3aed,
      emissiveIntensity: 0.35
    }),
    glass: new THREE.MeshPhysicalMaterial({
      color: 0xec4899,
      emissive: 0x831843,
      emissiveIntensity: 0.4,
      metalness: 0.05,
      roughness: 0.05,
      transmission: 0.85,
      ior: 1.45,
      transparent: true,
      opacity: 0.85
    }),
    sphereGlass: new THREE.MeshPhysicalMaterial({
      color: 0x8b5cf6,
      emissive: 0x3b0764,
      emissiveIntensity: 0.45,
      metalness: 0.1,
      roughness: 0.08,
      transmission: 0.82,
      ior: 1.52,
      clearcoat: 1.0,
      transparent: true,
      opacity: 0.78
    }),
    innerWhiteCrystal: new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xe9d5ff,
      emissiveIntensity: 0.8,
      metalness: 0.2,
      roughness: 0.1
    })
  };

  /**
   * Helper to create an Ethereum 3D Gem Geometry
   */
  function createEthereumGeometry(scale = 1) {
    const group = new THREE.Group();

    // Top pyramid (Octahedron top half)
    const topGeom = new THREE.ConeGeometry(1 * scale, 1.4 * scale, 4);
    topGeom.rotateY(Math.PI / 4);
    const topMesh = new THREE.Mesh(topGeom, materials.innerWhiteCrystal);
    topMesh.position.y = 0.72 * scale;
    group.add(topMesh);

    // Bottom pyramid (Octahedron bottom half)
    const bottomGeom = new THREE.ConeGeometry(1 * scale, 1.1 * scale, 4);
    bottomGeom.rotateY(Math.PI / 4);
    bottomGeom.rotateX(Math.PI);
    const bottomMesh = new THREE.Mesh(bottomGeom, materials.innerWhiteCrystal);
    bottomMesh.position.y = -0.6 * scale;
    group.add(bottomMesh);

    // Center divider thin diamond plate
    const midGeom = new THREE.CylinderGeometry(0.98 * scale, 0.98 * scale, 0.05 * scale, 4);
    midGeom.rotateY(Math.PI / 4);
    const midMesh = new THREE.Mesh(midGeom, materials.innerWhiteCrystal);
    midMesh.position.y = 0.01 * scale;
    group.add(midMesh);

    return group;
  }

  /**
   * Helper to create a Bitcoin 3D Coin
   */
  function createBitcoinGeometry(scale = 1) {
    const group = new THREE.Group();
    const coinGeom = new THREE.CylinderGeometry(1.2 * scale, 1.2 * scale, 0.25 * scale, 36);
    coinGeom.rotateX(Math.PI / 2);
    const coinMesh = new THREE.Mesh(coinGeom, materials[currentMaterialType]);
    group.add(coinMesh);

    // Embossed inner ring
    const ringGeom = new THREE.TorusGeometry(0.95 * scale, 0.06 * scale, 16, 40);
    const ringMesh = new THREE.Mesh(ringGeom, materials.innerWhiteCrystal);
    group.add(ringMesh);

    // ₿ center emblem geometry (stylized dual bars + dual loops)
    const bBarGeom = new THREE.BoxGeometry(0.18 * scale, 1.2 * scale, 0.3 * scale);
    const bBar = new THREE.Mesh(bBarGeom, materials.innerWhiteCrystal);
    bBar.position.x = -0.2 * scale;
    group.add(bBar);

    const bLoopTop = new THREE.TorusGeometry(0.28 * scale, 0.09 * scale, 12, 24, Math.PI);
    bLoopTop.rotateZ(-Math.PI / 2);
    const bLoopTopMesh = new THREE.Mesh(bLoopTop, materials.innerWhiteCrystal);
    bLoopTopMesh.position.set(-0.1 * scale, 0.28 * scale, 0);
    group.add(bLoopTopMesh);

    const bLoopBottom = new THREE.TorusGeometry(0.32 * scale, 0.09 * scale, 12, 24, Math.PI);
    bLoopBottom.rotateZ(-Math.PI / 2);
    const bLoopBottomMesh = new THREE.Mesh(bLoopBottom, materials.innerWhiteCrystal);
    bLoopBottomMesh.position.set(-0.1 * scale, -0.28 * scale, 0);
    group.add(bLoopBottomMesh);

    return group;
  }

  /**
   * Helper to create a Solana 3D Token
   */
  function createSolanaGeometry(scale = 1) {
    const group = new THREE.Group();
    const baseCoinGeom = new THREE.CylinderGeometry(1.2 * scale, 1.2 * scale, 0.2 * scale, 36);
    baseCoinGeom.rotateX(Math.PI / 2);
    const baseCoin = new THREE.Mesh(baseCoinGeom, materials[currentMaterialType]);
    group.add(baseCoin);

    // 3 slanted gradient bars
    [-0.45, 0, 0.45].forEach((yPos, idx) => {
      const barGeom = new THREE.BoxGeometry(1.1 * scale, 0.16 * scale, 0.25 * scale);
      barGeom.rotateZ(idx % 2 === 0 ? 0.3 : -0.3);
      const bar = new THREE.Mesh(barGeom, materials.innerWhiteCrystal);
      bar.position.y = yPos * scale;
      group.add(bar);
    });

    return group;
  }

  /**
   * Helper to create a Fiat ($ / € / ₽) or Generic Token
   */
  function createFiatGeometry(symbol = '$', scale = 1) {
    const group = new THREE.Group();
    const coinGeom = new THREE.CylinderGeometry(1.25 * scale, 1.25 * scale, 0.22 * scale, 48);
    coinGeom.rotateX(Math.PI / 2);
    const coinMesh = new THREE.Mesh(coinGeom, materials[currentMaterialType]);
    group.add(coinMesh);

    const ringGeom = new THREE.TorusGeometry(1.05 * scale, 0.05 * scale, 16, 48);
    const ringMesh = new THREE.Mesh(ringGeom, materials.innerWhiteCrystal);
    group.add(ringMesh);

    // Central geometric icon
    const pillarGeom = new THREE.BoxGeometry(0.18 * scale, 1.1 * scale, 0.28 * scale);
    const pillar = new THREE.Mesh(pillarGeom, materials.innerWhiteCrystal);
    group.add(pillar);

    const crossGeom = new THREE.BoxGeometry(0.7 * scale, 0.16 * scale, 0.28 * scale);
    const cross = new THREE.Mesh(crossGeom, materials.innerWhiteCrystal);
    group.add(cross);

    return group;
  }

  /**
   * Build the complete Token Model for the Stage
   */
  function buildStageToken(tokenCode) {
    if (!stageScene) return;

    if (stageMeshGroup) {
      stageScene.remove(stageMeshGroup);
    }

    stageMeshGroup = new THREE.Group();

    let model;
    if (tokenCode === 'ETH') {
      model = createEthereumGeometry(1.2);
      // Give ETH outer glass jewel enclosing if crystal
      const jewelGeom = new THREE.OctahedronGeometry(1.8, 1);
      const jewel = new THREE.Mesh(jewelGeom, materials[currentMaterialType]);
      stageMeshGroup.add(jewel);
    } else if (tokenCode === 'BTC') {
      model = createBitcoinGeometry(1.2);
    } else if (tokenCode === 'SOL') {
      model = createSolanaGeometry(1.2);
    } else {
      model = createFiatGeometry(tokenCode, 1.2);
    }

    stageMeshGroup.add(model);
    stageScene.add(stageMeshGroup);
  }

  /**
   * Initialize Hero Banner Scene (Exact replica of the 3 purple glowing spheres from screenshot)
   */
  function initHeroScene() {
    const container = document.getElementById('three-hero-canvas-container');
    if (!container) return;

    heroScene = new THREE.Scene();
    const width = container.clientWidth;
    const height = container.clientHeight;

    heroCamera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    heroCamera.position.z = 18;

    heroRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    heroRenderer.setSize(width, height);
    heroRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    heroRenderer.toneMapping = THREE.ACESFilmicToneMapping;
    heroRenderer.toneMappingExposure = 1.3;
    container.appendChild(heroRenderer.domElement);

    // Hero Lighting matching vibrant magenta/purple aesthetic
    const ambientLight = new THREE.AmbientLight(0x2a0845, 1.8);
    heroScene.add(ambientLight);

    const magentaPointLight = new THREE.PointLight(0xd946ef, 3.5, 50);
    magentaPointLight.position.set(-10, 10, 10);
    heroScene.add(magentaPointLight);

    const cyanPointLight = new THREE.PointLight(0x06b6d4, 1.8, 40);
    cyanPointLight.position.set(12, -8, 8);
    heroScene.add(cyanPointLight);

    const purpleBackLight = new THREE.PointLight(0xa855f7, 4.0, 50);
    purpleBackLight.position.set(0, 0, -10);
    heroScene.add(purpleBackLight);

    heroOrbsGroup = new THREE.Group();
    heroScene.add(heroOrbsGroup);

    // Helper: create a glossy glowing purple sphere containing an Ethereum crystal
    function createGlowingHeroOrb(radius, position, rotation, scaleEth = 0.55) {
      const orbGroup = new THREE.Group();
      orbGroup.position.copy(position);
      orbGroup.rotation.copy(rotation);

      // Translucent glossy glass sphere
      const sphereGeom = new THREE.SphereGeometry(radius, 48, 48);
      const sphereMesh = new THREE.Mesh(sphereGeom, materials.sphereGlass);
      orbGroup.add(sphereMesh);

      // Glowing rim edge
      const rimGeom = new THREE.TorusGeometry(radius * 0.98, radius * 0.05, 16, 48);
      const rimMat = new THREE.MeshBasicMaterial({
        color: 0xf472b6,
        transparent: true,
        opacity: 0.65,
        blending: THREE.AdditiveBlending
      });
      const rimMesh = new THREE.Mesh(rimGeom, rimMat);
      rimMesh.rotation.x = Math.PI / 2.3;
      orbGroup.add(rimMesh);

      // Inner Ethereum diamond crystal
      const ethCrystal = createEthereumGeometry(scaleEth * radius);
      orbGroup.add(ethCrystal);

      // Subtle specular reflection disc on top
      const specGeom = new THREE.CircleGeometry(radius * 0.35, 24);
      const specMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide
      });
      const specMesh = new THREE.Mesh(specGeom, specMat);
      specMesh.position.set(-radius * 0.3, radius * 0.55, radius * 0.7);
      specMesh.rotation.y = -0.3;
      orbGroup.add(specMesh);

      return orbGroup;
    }

    // 1. Top-Left Small Orb (like in screenshot)
    const orb1 = createGlowingHeroOrb(
      1.1,
      new THREE.Vector3(-6.2, 5.0, -1.0),
      new THREE.Euler(0.2, 0.4, 0.1),
      0.55
    );
    orb1.userData = { baseY: 5.0, floatSpeed: 0.0018, floatOffset: 0, rotSpeed: 0.008 };
    heroOrbsGroup.add(orb1);

    // 2. Center-Left Medium Orb (tilted, floating mid-height)
    const orb2 = createGlowingHeroOrb(
      2.1,
      new THREE.Vector3(-9.5, 2.0, 1.5),
      new THREE.Euler(0.3, -0.5, 0.2),
      0.58
    );
    orb2.userData = { baseY: 2.0, floatSpeed: 0.0014, floatOffset: 2.0, rotSpeed: 0.006 };
    heroOrbsGroup.add(orb2);

    // 3. Right Large Glorious Orb (prominent, glossy, foreground)
    const orb3 = createGlowingHeroOrb(
      3.2,
      new THREE.Vector3(8.8, 3.0, 2.5),
      new THREE.Euler(-0.2, 0.6, -0.1),
      0.62
    );
    orb3.userData = { baseY: 3.0, floatSpeed: 0.0012, floatOffset: 4.0, rotSpeed: 0.005 };
    heroOrbsGroup.add(orb3);

    // Extra subtle floating micro-crystals in background
    const starGeom = new THREE.BufferGeometry();
    const starCount = 65;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 35;
      starPositions[i + 1] = (Math.random() - 0.5) * 20;
      starPositions[i + 2] = (Math.random() - 0.5) * 15;
    }
    starGeom.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xf472b6,
      size: 0.16,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });
    const starPoints = new THREE.Points(starGeom, starMat);
    heroScene.add(starPoints);

    // Resize Handler
    window.addEventListener('resize', onHeroResize);
  }

  function onHeroResize() {
    const container = document.getElementById('three-hero-canvas-container');
    if (!container || !heroRenderer || !heroCamera) return;
    const width = container.clientWidth;
    const height = container.clientHeight;
    heroCamera.aspect = width / height;
    heroCamera.updateProjectionMatrix();
    heroRenderer.setSize(width, height);
  }

  /**
   * Initialize Interactive 3D Coin Stage Scene
   */
  function initStageScene() {
    const container = document.getElementById('three-stage-container');
    if (!container) return;

    stageScene = new THREE.Scene();
    const width = container.clientWidth;
    const height = container.clientHeight;

    stageCamera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    stageCamera.position.z = 6.2;

    stageRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    stageRenderer.setSize(width, height);
    stageRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    stageRenderer.toneMapping = THREE.ACESFilmicToneMapping;
    stageRenderer.toneMappingExposure = 1.4;
    container.appendChild(stageRenderer.domElement);

    // Stage Lighting
    const amb = new THREE.AmbientLight(0x2e1065, 1.6);
    stageScene.add(amb);

    const keyLight = new THREE.PointLight(0xd946ef, 3.2, 25);
    keyLight.position.set(5, 5, 6);
    stageScene.add(keyLight);

    const rimLight = new THREE.PointLight(0x06b6d4, 2.8, 25);
    rimLight.position.set(-6, -4, 4);
    stageScene.add(rimLight);

    const topGlow = new THREE.PointLight(0xffffff, 1.8, 15);
    topGlow.position.set(0, 6, 2);
    stageScene.add(topGlow);

    // Build Initial Token
    buildStageToken(currentTokenCode);

    // Mouse & Touch Drag Controls for Stage
    const dom = container;

    dom.addEventListener('mousedown', (e) => {
      isDraggingStage = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
      isDraggingStage = false;
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDraggingStage || !stageMeshGroup) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      stageMeshGroup.rotation.y += deltaX * 0.01;
      stageMeshGroup.rotation.x += deltaY * 0.01;

      stageRotationVelocity.y = deltaX * 0.004;
      stageRotationVelocity.x = deltaY * 0.004;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    // Touch Support
    dom.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        isDraggingStage = true;
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      isDraggingStage = false;
    });

    window.addEventListener('touchmove', (e) => {
      if (!isDraggingStage || !stageMeshGroup || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - previousMousePosition.x;
      const deltaY = e.touches[0].clientY - previousMousePosition.y;

      stageMeshGroup.rotation.y += deltaX * 0.012;
      stageMeshGroup.rotation.x += deltaY * 0.012;

      stageRotationVelocity.y = deltaX * 0.005;
      stageRotationVelocity.x = deltaY * 0.005;

      previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }, { passive: true });

    window.addEventListener('resize', onStageResize);
  }

  function onStageResize() {
    const container = document.getElementById('three-stage-container');
    if (!container || !stageRenderer || !stageCamera) return;
    const width = container.clientWidth;
    const height = container.clientHeight;
    stageCamera.aspect = width / height;
    stageCamera.updateProjectionMatrix();
    stageRenderer.setSize(width, height);
  }

  /**
   * Track global cursor for 3D parallax
   */
  window.addEventListener('mousemove', (e) => {
    targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  /**
   * Main Animation Loop
   */
  let clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    // Smooth Parallax Interpolation
    mouseX += (targetMouseX - mouseX) * 0.05;
    mouseY += (targetMouseY - mouseY) * 0.05;

    // 1. Animate Hero Scene
    if (heroRenderer && heroScene && heroCamera && heroOrbsGroup) {
      // Parallax shift
      heroOrbsGroup.position.x = mouseX * 1.5;
      heroOrbsGroup.position.y = -mouseY * 0.8;
      heroOrbsGroup.rotation.y = mouseX * 0.12;

      // Bobbing floating motion for the 3 orbs
      heroOrbsGroup.children.forEach((orb) => {
        if (orb.userData) {
          const { baseY, floatSpeed, floatOffset, rotSpeed } = orb.userData;
          orb.position.y = baseY + Math.sin(elapsedTime * 2 + floatOffset) * 0.35;
          orb.rotation.y += rotSpeed;
          orb.rotation.x += rotSpeed * 0.5;
        }
      });

      heroRenderer.render(heroScene, heroCamera);
    }

    // 2. Animate Stage Scene
    if (stageRenderer && stageScene && stageCamera && stageMeshGroup) {
      if (!isDraggingStage) {
        // Natural smooth idle inertia + auto-spin
        stageMeshGroup.rotation.y += stageRotationVelocity.y;
        stageMeshGroup.rotation.x += stageRotationVelocity.x;

        // Dampen excess velocity towards standard idle speed
        stageRotationVelocity.y += (0.012 - stageRotationVelocity.y) * 0.02;
        stageRotationVelocity.x += (0 - stageRotationVelocity.x) * 0.05;

        // Floating bounce
        stageMeshGroup.position.y = Math.sin(elapsedTime * 2.5) * 0.12;
      }

      stageRenderer.render(stageScene, stageCamera);
    }
  }

  /**
   * Public API
   */
  return {
    init: function () {
      initHeroScene();
      initStageScene();
      animate();
    },

    setToken: function (tokenCode) {
      currentTokenCode = tokenCode;
      buildStageToken(tokenCode);
    },

    setMaterial: function (matKey) {
      if (materials[matKey]) {
        currentMaterialType = matKey;
        buildStageToken(currentTokenCode);
      }
    }
  };
})();

// Auto-boot 3D when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  if (typeof THREE !== 'undefined') {
    window.ThreeApp.init();
  }
});
