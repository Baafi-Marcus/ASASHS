import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface CrestScrollytelling3DProps {
  onLoginClick: () => void;
  onAdmissionsClick?: () => void;
}

export const CrestScrollytelling3D: React.FC<CrestScrollytelling3DProps> = ({
  onLoginClick,
  onAdmissionsClick = () => window.open('https://www.myshsadmission.net/site/schools/ASASHS/', '_blank'),
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // --- Three.js Scene Setup ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x05070e);
    scene.fog = new THREE.FogExp2(0x05070e, 0.035);

    const camera = new THREE.PerspectiveCamera(
      45,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 9);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff3d6, 3.5);
    keyLight.position.set(5, 8, 6);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x22c55e, 2.5);
    rimLight.position.set(-6, -4, -4);
    scene.add(rimLight);

    const goldAccentLight = new THREE.PointLight(0xf59e0b, 4.0, 15);
    goldAccentLight.position.set(0, 2, 4);
    scene.add(goldAccentLight);

    // --- Materials ---
    const goldMaterial = new THREE.MeshStandardMaterial({
      color: 0xf5b700,
      metalness: 0.88,
      roughness: 0.22,
    });

    const shieldGreenMaterial = new THREE.MeshStandardMaterial({
      color: 0x0c3e1e,
      metalness: 0.45,
      roughness: 0.35,
    });

    const innerEnamelMaterial = new THREE.MeshStandardMaterial({
      color: 0x052e16,
      metalness: 0.25,
      roughness: 0.5,
    });

    const parchmentMaterial = new THREE.MeshStandardMaterial({
      color: 0xfbf8f1,
      metalness: 0.05,
      roughness: 0.4,
    });

    const flameMaterial = new THREE.MeshStandardMaterial({
      color: 0xff7700,
      emissive: 0xff3b00,
      emissiveIntensity: 1.4,
      roughness: 0.2,
    });

    // --- 3D Model Construction (Procedural Heraldic Layers) ---
    const masterGroup = new THREE.Group();
    scene.add(masterGroup);

    // 1. LAYER: Shield Plate (Center)
    const shieldGroup = new THREE.Group();
    masterGroup.add(shieldGroup);

    const shieldShape = new THREE.Shape();
    shieldShape.moveTo(0, 2.0);
    shieldShape.lineTo(1.4, 2.0);
    shieldShape.bezierCurveTo(1.55, 1.0, 1.35, -0.4, 0, -2.1);
    shieldShape.bezierCurveTo(-1.35, -0.4, -1.55, 1.0, -1.4, 2.0);
    shieldShape.closePath();

    const shieldGeometry = new THREE.ExtrudeGeometry(shieldShape, {
      depth: 0.22,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.08,
      bevelThickness: 0.08,
    });
    shieldGeometry.center();

    const shieldMesh = new THREE.Mesh(shieldGeometry, shieldGreenMaterial);
    shieldGroup.add(shieldMesh);

    // Shield Golden Rim Inset
    const shieldRimGeom = new THREE.TorusGeometry(1.6, 0.04, 12, 48);
    shieldRimGeom.scale(1, 1.25, 0.4);
    const shieldRimMesh = new THREE.Mesh(shieldRimGeom, goldMaterial);
    shieldRimMesh.position.z = 0.16;
    shieldGroup.add(shieldRimMesh);

    // Inner Crest Cross Bars
    const barHGeom = new THREE.BoxGeometry(2.1, 0.08, 0.06);
    const barVGeom = new THREE.BoxGeometry(0.08, 2.7, 0.06);
    const barH = new THREE.Mesh(barHGeom, goldMaterial);
    const barV = new THREE.Mesh(barVGeom, goldMaterial);
    barH.position.z = 0.18;
    barV.position.z = 0.18;
    shieldGroup.add(barH);
    shieldGroup.add(barV);

    // 2. LAYER: Laurel Victory Crown & Stars (Top)
    const crownGroup = new THREE.Group();
    masterGroup.add(crownGroup);

    // Three Stars on Top
    const starShape = new THREE.Shape();
    const points = 5;
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? 0.32 : 0.14;
      const angle = (i * Math.PI) / points - Math.PI / 2;
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      if (i === 0) starShape.moveTo(x, y);
      else starShape.lineTo(x, y);
    }
    starShape.closePath();

    const starGeom = new THREE.ExtrudeGeometry(starShape, {
      depth: 0.08,
      bevelEnabled: true,
      bevelSize: 0.03,
      bevelThickness: 0.03,
    });
    starGeom.center();

    const centerStar = new THREE.Mesh(starGeom, goldMaterial);
    centerStar.position.set(0, 2.65, 0.1);
    centerStar.scale.set(1.2, 1.2, 1.2);
    crownGroup.add(centerStar);

    const leftStar = new THREE.Mesh(starGeom, goldMaterial);
    leftStar.position.set(-0.85, 2.5, 0.05);
    leftStar.scale.set(0.9, 0.9, 0.9);
    crownGroup.add(leftStar);

    const rightStar = new THREE.Mesh(starGeom, goldMaterial);
    rightStar.position.set(0.85, 2.5, 0.05);
    rightStar.scale.set(0.9, 0.9, 0.9);
    crownGroup.add(rightStar);

    // Laurel Leaf Clusters
    const leafGeom = new THREE.ConeGeometry(0.12, 0.45, 5);
    for (let i = 0; i < 14; i++) {
      const angle = (i / 13) * Math.PI * 0.95 + 0.08;
      const x = Math.cos(angle) * 1.85;
      const y = Math.sin(angle) * 2.1 + 0.1;

      // Left branch leaf
      const leafLeft = new THREE.Mesh(leafGeom, goldMaterial);
      leafLeft.position.set(-x, y, 0);
      leafLeft.rotation.z = angle - Math.PI / 2 + 0.3;
      leafLeft.rotation.x = 0.2;
      crownGroup.add(leafLeft);

      // Right branch leaf
      const leafRight = new THREE.Mesh(leafGeom, goldMaterial);
      leafRight.position.set(x, y, 0);
      leafRight.rotation.z = -angle + Math.PI / 2 - 0.3;
      leafRight.rotation.x = 0.2;
      crownGroup.add(leafRight);
    }

    // 3. LAYER: Open Book of Knowledge (Z-Axis Forward)
    const bookGroup = new THREE.Group();
    masterGroup.add(bookGroup);

    const pageGeom = new THREE.BoxGeometry(0.7, 0.9, 0.04);
    const leftPage = new THREE.Mesh(pageGeom, parchmentMaterial);
    leftPage.position.set(-0.35, 0.1, 0.45);
    leftPage.rotation.y = 0.28;
    bookGroup.add(leftPage);

    const rightPage = new THREE.Mesh(pageGeom, parchmentMaterial);
    rightPage.position.set(0.35, 0.1, 0.45);
    rightPage.rotation.y = -0.28;
    bookGroup.add(rightPage);

    const spineGeom = new THREE.CylinderGeometry(0.04, 0.04, 0.92, 8);
    const spineMesh = new THREE.Mesh(spineGeom, goldMaterial);
    spineMesh.position.set(0, 0.1, 0.36);
    bookGroup.add(spineMesh);

    // Text Lines on Pages
    for (let l = 0; l < 4; l++) {
      const lineGeom = new THREE.BoxGeometry(0.48, 0.025, 0.01);
      const lineL = new THREE.Mesh(lineGeom, goldMaterial);
      lineL.position.set(-0.35, 0.3 - l * 0.15, 0.48);
      lineL.rotation.y = 0.28;
      bookGroup.add(lineL);

      const lineR = new THREE.Mesh(lineGeom, goldMaterial);
      lineR.position.set(0.35, 0.3 - l * 0.15, 0.48);
      lineR.rotation.y = -0.28;
      bookGroup.add(lineR);
    }

    // 4. LAYER: Torch of Integrity & Moral Uprightness (Central Float)
    const torchGroup = new THREE.Group();
    masterGroup.add(torchGroup);

    const torchHandleGeom = new THREE.CylinderGeometry(0.08, 0.05, 0.85, 12);
    const torchHandle = new THREE.Mesh(torchHandleGeom, goldMaterial);
    torchHandle.position.set(0, 0.7, 0.55);
    torchGroup.add(torchHandle);

    const torchCupGeom = new THREE.CylinderGeometry(0.18, 0.08, 0.22, 12);
    const torchCup = new THREE.Mesh(torchCupGeom, goldMaterial);
    torchCup.position.set(0, 1.15, 0.55);
    torchGroup.add(torchCup);

    // Stylized Flame Mesh
    const flameGeom = new THREE.ConeGeometry(0.16, 0.48, 8);
    flameGeom.translate(0, 0.24, 0);
    const flameMesh = new THREE.Mesh(flameGeom, flameMaterial);
    flameMesh.position.set(0, 1.25, 0.55);
    torchGroup.add(flameMesh);

    // 5. LAYER: Foundation Motto Ribbon (Bottom Sweep)
    const ribbonGroup = new THREE.Group();
    masterGroup.add(ribbonGroup);

    const ribbonCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.8, -2.2, 0.3),
      new THREE.Vector3(-0.9, -2.35, 0.6),
      new THREE.Vector3(0, -2.4, 0.7),
      new THREE.Vector3(0.9, -2.35, 0.6),
      new THREE.Vector3(1.8, -2.2, 0.3),
    ]);

    const ribbonGeom = new THREE.TubeGeometry(ribbonCurve, 32, 0.12, 8, false);
    const ribbonMesh = new THREE.Mesh(ribbonGeom, goldMaterial);
    ribbonGroup.add(ribbonMesh);

    // Floating Stardust/Particle Field
    const particleCount = 120;
    const particleGeom = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let p = 0; p < particleCount * 3; p += 3) {
      particlePositions[p] = (Math.random() - 0.5) * 12;
      particlePositions[p + 1] = (Math.random() - 0.5) * 10;
      particlePositions[p + 2] = (Math.random() - 0.5) * 6;
    }
    particleGeom.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xf59e0b,
      size: 0.045,
      transparent: true,
      opacity: 0.65,
    });
    const particleSystem = new THREE.Points(particleGeom, particleMat);
    scene.add(particleSystem);

    // --- Animation & Scroll Tracking State ---
    let currentProgress = 0;
    let targetProgress = 0;
    let animationFrameId: number;

    const handleScroll = () => {
      const rect = container.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const totalScrollDistance = rect.height - windowHeight;
      if (totalScrollDistance <= 0) return;

      const topOffset = -rect.top;
      const progress = Math.max(0, Math.min(1, topOffset / totalScrollDistance));
      targetProgress = progress;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // Resize Handler
    const handleResize = () => {
      if (!canvas) return;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    window.addEventListener('resize', handleResize);

    // --- Render Loop (Lerped 60fps) ---
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth Lerp of Scroll Progress
      currentProgress += (targetProgress - currentProgress) * 0.09;

      // 1. Overall Scene / Camera Drift
      masterGroup.rotation.y = THREE.MathUtils.lerp(
        Math.sin(elapsedTime * 0.4) * 0.08,
        Math.PI * 0.35 * (currentProgress - 0.5),
        0.5
      );
      masterGroup.rotation.x = Math.sin(elapsedTime * 0.3) * 0.04 + currentProgress * 0.12;

      // 2. Disassembly / Explosion Animation Curve
      // Explosion peaks between 25% and 75%, then reassembles cleanly
      let explodeFactor = 0;
      if (currentProgress < 0.2) {
        explodeFactor = currentProgress / 0.2;
      } else if (currentProgress <= 0.75) {
        explodeFactor = 1.0;
      } else {
        explodeFactor = Math.max(0, 1.0 - (currentProgress - 0.75) / 0.22);
      }

      // Smooth Easing (cubic)
      const e = explodeFactor * explodeFactor * (3 - 2 * explodeFactor);

      // Apply Layer Offsets along Exploded Axes:
      // Crown & Stars: float up (+Y) and push back (-Z)
      crownGroup.position.y = THREE.MathUtils.lerp(0, 2.2, e);
      crownGroup.position.z = THREE.MathUtils.lerp(0, -1.2, e);
      crownGroup.rotation.x = THREE.MathUtils.lerp(0, -0.25, e);

      // Shield Plate: tilts back and lowers slightly
      shieldGroup.position.y = THREE.MathUtils.lerp(0, -0.4, e);
      shieldGroup.position.z = THREE.MathUtils.lerp(0, -0.6, e);
      shieldGroup.rotation.x = THREE.MathUtils.lerp(0, -0.32, e);

      // Book of Knowledge: floats straight forward towards camera (+Z)
      bookGroup.position.z = THREE.MathUtils.lerp(0, 2.2, e);
      bookGroup.position.y = THREE.MathUtils.lerp(0, -0.2, e);
      bookGroup.rotation.x = THREE.MathUtils.lerp(0, 0.15, e);

      // Torch of Integrity: lifts upward and floats suspended
      torchGroup.position.y = THREE.MathUtils.lerp(0, 1.3, e);
      torchGroup.position.z = THREE.MathUtils.lerp(0, 1.1, e);
      torchGroup.rotation.y = THREE.MathUtils.lerp(0, 0.2, e);

      // Ribbon: drops down (-Y) and tilts forward (+Z)
      ribbonGroup.position.y = THREE.MathUtils.lerp(0, -1.6, e);
      ribbonGroup.position.z = THREE.MathUtils.lerp(0, 1.2, e);
      ribbonGroup.rotation.x = THREE.MathUtils.lerp(0, 0.28, e);

      // Subtle Flame Flicker
      flameMesh.scale.set(
        1 + Math.sin(elapsedTime * 12) * 0.08,
        1 + Math.cos(elapsedTime * 10) * 0.12,
        1 + Math.sin(elapsedTime * 14) * 0.08
      );

      // Slowly rotate background particle field
      particleSystem.rotation.y = elapsedTime * 0.02;

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup on Unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);

      // Dispose Geometries and Materials
      shieldGeometry.dispose();
      shieldRimGeom.dispose();
      barHGeom.dispose();
      barVGeom.dispose();
      starGeom.dispose();
      leafGeom.dispose();
      pageGeom.dispose();
      spineGeom.dispose();
      torchHandleGeom.dispose();
      torchCupGeom.dispose();
      flameGeom.dispose();
      ribbonGeom.dispose();
      particleGeom.dispose();

      goldMaterial.dispose();
      shieldGreenMaterial.dispose();
      innerEnamelMaterial.dispose();
      parchmentMaterial.dispose();
      flameMaterial.dispose();
      particleMat.dispose();

      renderer.dispose();
    };
  }, []);

  // Compute Active Story Beat (0 to 4)
  // Beat 1: 0% - 18% (Hero Seal)
  // Beat 2: 20% - 38% (Book / Academic Curriculum)
  // Beat 3: 40% - 60% (Torch / Godliness & Morals)
  // Beat 4: 62% - 82% (Laurel / Athletics & National Competitions)
  // Beat 5: 84% - 100% (Reassembled Gateway / Admissions)

  const isBeat1 = scrollProgress < 0.18;
  const isBeat2 = scrollProgress >= 0.18 && scrollProgress < 0.38;
  const isBeat3 = scrollProgress >= 0.38 && scrollProgress < 0.60;
  const isBeat4 = scrollProgress >= 0.60 && scrollProgress < 0.82;
  const isBeat5 = scrollProgress >= 0.82;

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-[#05070e] text-white"
      style={{ height: '350vh' }}
    >
      {/* Sticky Full-Viewport Viewport Canvas */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center pointer-events-none">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full block"
        />

        {/* HUD Telemetry & Progress Indicator */}
        <div className="absolute top-20 right-6 sm:right-12 pointer-events-auto flex items-center space-x-3 text-[11px] font-mono uppercase tracking-widest text-gray-400 bg-black/40 px-3 py-1.5 rounded-sm border border-white/10 backdrop-blur-md">
          <span className="w-2 h-2 rounded-sm bg-yellow-400"></span>
          <span>Heraldic 3D Exploded View</span>
          <span className="text-white font-bold tabular-nums">
            {Math.round(scrollProgress * 100)}%
          </span>
        </div>

        {/* Copy Overlays (Keynote Typography - 5 Story Beats) */}
        <div className="relative z-20 w-full max-w-7xl mx-auto px-6 sm:px-12 pointer-events-auto">
          {/* BEAT 1: Hero Assembled Pose */}
          <div
            className={`transition-all duration-500 max-w-xl mx-auto text-center ${
              isBeat1
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 -translate-y-4 pointer-events-none absolute inset-x-0'
            }`}
          >
            <div className="inline-flex items-center space-x-2 py-1 px-3 rounded-sm bg-school-green-950/80 border border-school-green-700/60 text-[11px] uppercase font-bold text-school-green-300 mb-4 backdrop-blur-sm">
              <span>The Heraldic Seal</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
              Anatomy of <br />
              <span className="text-yellow-400">Excellence & Heritage</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-md mx-auto">
              Scroll down to explore the symbolic layers comprising thirty-four years of leadership, discipline, and moral distinction at Akim Asafo SHS.
            </p>
            <div className="mt-6 flex items-center justify-center space-x-2 text-gray-400 text-xs font-mono uppercase tracking-wider">
              <span>Scroll to disassemble</span>
              <span className="animate-bounce">↓</span>
            </div>
          </div>

          {/* BEAT 2: The Open Book (Academic Curriculum) */}
          <div
            className={`transition-all duration-500 max-w-md ${
              isBeat2
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 -translate-x-6 pointer-events-none absolute'
            }`}
          >
            <div className="p-6 rounded-md border border-white/15 bg-black/65 backdrop-blur-md shadow-2xl">
              <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-widest block mb-2">
                Layer 01 • Core Scholarship
              </span>
              <h3 className="text-xl sm:text-2xl font-bold mb-3 tracking-tight">
                The Open Book of Knowledge
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed mb-4">
                Positioned at the heart of our crest, the open pages embody rigorous instructional delivery across Science, General Arts, Business, Visual Arts, and Home Economics.
              </p>
              <div className="flex items-center space-x-2 text-[11px] text-school-green-400 font-semibold uppercase tracking-wider pt-3 border-t border-white/10">
                <span>GES Accredited Curriculum</span>
                <span>•</span>
                <span className="tabular-nums">6 Academic Tracks</span>
              </div>
            </div>
          </div>

          {/* BEAT 3: The Torch (Moral Uprightness & Faith) */}
          <div
            className={`transition-all duration-500 max-w-md ml-auto ${
              isBeat3
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 translate-x-6 pointer-events-none absolute'
            }`}
          >
            <div className="p-6 rounded-md border border-white/15 bg-black/65 backdrop-blur-md shadow-2xl">
              <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-widest block mb-2">
                Layer 02 • Core Values
              </span>
              <h3 className="text-xl sm:text-2xl font-bold mb-3 tracking-tight">
                The Torch of Integrity
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed mb-4">
                Ascending from the center, the golden flame signifies our founding motto: inculcating Godliness, strict personal discipline, and lifelong moral uprightness in every scholar.
              </p>
              <div className="flex items-center space-x-2 text-[11px] text-amber-400 font-semibold uppercase tracking-wider pt-3 border-t border-white/10">
                <span>Character Formation</span>
                <span>•</span>
                <span>Holistic Nurturing</span>
              </div>
            </div>
          </div>

          {/* BEAT 4: Laurel Wreath & Victory Crown */}
          <div
            className={`transition-all duration-500 max-w-md ${
              isBeat4
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 -translate-x-6 pointer-events-none absolute'
            }`}
          >
            <div className="p-6 rounded-md border border-white/15 bg-black/65 backdrop-blur-md shadow-2xl">
              <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-widest block mb-2">
                Layer 03 • Competitive Distinction
              </span>
              <h3 className="text-xl sm:text-2xl font-bold mb-3 tracking-tight">
                The Laurel of Victory
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed mb-4">
                Encircling the seal, the golden laurel leaves and three summit stars honor municipal championships in handball, debate finalists, and NSMQ regional qualifiers.
              </p>
              <div className="flex items-center space-x-2 text-[11px] text-yellow-400 font-semibold uppercase tracking-wider pt-3 border-t border-white/10">
                <span>Best Performing SHS Award</span>
                <span>•</span>
                <span className="tabular-nums">2025</span>
              </div>
            </div>
          </div>

          {/* BEAT 5: Reassembled Seal & Action Gateway */}
          <div
            className={`transition-all duration-500 max-w-lg mx-auto text-center ${
              isBeat5
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-6 pointer-events-none absolute inset-x-0'
            }`}
          >
            <div className="p-8 rounded-md border border-yellow-500/40 bg-black/75 backdrop-blur-md shadow-2xl">
              <div className="inline-flex items-center space-x-2 py-1 px-3 rounded-sm bg-yellow-400/20 text-yellow-300 text-[10px] font-bold uppercase tracking-widest mb-4 border border-yellow-400/30">
                <span>United in Purpose</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold mb-3 tracking-tight">
                One Institution. One Vision.
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-6">
                Akim Asafo Senior High School continues to mould the next generation of Ghanaian leaders, scientists, and professionals.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <button
                  onClick={onAdmissionsClick}
                  className="px-6 py-3 bg-school-green-700 hover:bg-school-green-800 text-white rounded-sm font-bold text-xs uppercase tracking-wider transition-colors border border-school-green-600 shadow-sm min-h-[44px]"
                >
                  Apply for Admission
                </button>
                <button
                  onClick={onLoginClick}
                  className="px-6 py-3 bg-white hover:bg-gray-100 text-gray-900 rounded-sm font-bold text-xs uppercase tracking-wider transition-colors border border-gray-200 shadow-sm min-h-[44px]"
                >
                  Access Student Portal
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
