/**
 * CELESTIAL STAR BOUQUET - THREE.JS ENGINE (MASTER FLORIST EDITION)
 * Designed for pure visual excellence:
 * - True sculpted Rose Petals with velvety smooth shading and natural organic curves
 * - Authentic Korean/French florist wrapping paper with fluted chalice shape, layered origami folds, and gold piping
 * - Elegant Flat Satin Pink Ribbon & Bow (no tubes/macaroni, real flat ribbon fabric)
 * - Harmonious multi-point studio lighting so colors are vibrant, warm, and crystal clear
 */

class CelestialBouquet {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.animationId = null;

    // Groups
    this.bouquetGroup = new THREE.Group();
    this.ambientStarsGroup = new THREE.Group();
    this.firefliesGroup = new THREE.Group();
    this.shootingStars = [];
    this.allParticleSystems = [];

    this.clock = new THREE.Clock();

    // Curated Color Palette
    this.colors = {
      // Blue Aqua Rose Petal Gradients
      roseCore: 0x0284c7,      // Deep ocean cyan
      roseInner: 0x0ea5e9,     // Vibrant sky aqua
      roseMid: 0x38bdf8,       // Luminous soft aqua
      roseOuter: 0x7dd3fc,     // Pastel starlight aqua
      roseEdge: 0xe0f2fe,      // Icy starlight highlight

      // Florist Foliage
      leafDeep: 0x064e3b,      // Deep emerald
      leafMid: 0x0d9488,       // Teal green

      // Luxury Florist Wrapping Paper (Elegant dusty slate navy & frosted mist, NOT pitch black)
      paperOuter: 0x1e293b,    // Slate navy luxury matte paper
      paperInner: 0xe2e8f0,    // Soft frosted white/ice inner sheet
      goldEdge: 0xf59e0b,      // Warm metallic gold trim line

      // Satin Pink Ribbon (Real flat fabric)
      ribbonPink: 0xf472b6,    // Blush rose pink
      ribbonHighlight: 0xfbcfe8// Satin sheen highlight
    };

    this.starTexture = this.createStarTexture();
    this.init();
  }

  // Soft glowing starlight texture
  createStarTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const center = 32;

    const grad = ctx.createRadialGradient(center, center, 0, center, center, 28);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.2, 'rgba(186, 230, 253, 0.9)');
    grad.addColorStop(0.5, 'rgba(56, 189, 248, 0.4)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(center, center, 28, 0, Math.PI * 2);
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    texture.premultiplyAlpha = true;
    return texture;
  }

  init() {
    if (!this.container) return;

    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x030712, 0.012);

    // 2. Camera Setup
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    this.camera.position.set(0, 2.5, 28);

    // 3. Renderer with high color fidelity & soft filmic tone
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.container.appendChild(this.renderer.domElement);

    // 4. Orbit Controls (360° smooth rotation)
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 0.55;
    this.controls.minDistance = 14;
    this.controls.maxDistance = 50;
    this.controls.maxPolarAngle = Math.PI / 2 + 0.25;
    this.controls.target.set(0, 0.3, 0);

    // 5. Studio Multi-Point Lighting (Well lit from all sides, NO pitch black areas!)
    const ambientLight = new THREE.AmbientLight(0x334155, 1.8); // Gentle ambient so shadows are soft slate blue
    this.scene.add(ambientLight);

    // Main Key Light (Top-Right-Front)
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
    keyLight.position.set(10, 16, 14);
    this.scene.add(keyLight);

    // Front Camera Fill Light (Ensures front wrapping and bow are vibrantly illuminated)
    const frontFill = new THREE.DirectionalLight(0xf8fafc, 1.0);
    frontFill.position.set(0, 4, 20);
    this.scene.add(frontFill);

    // Left Aqua Fill Light (Soft cool tones)
    const leftFill = new THREE.DirectionalLight(0x7dd3fc, 0.8);
    leftFill.position.set(-14, 8, 8);
    this.scene.add(leftFill);

    // Warm Rose Rim Light (Back-Bottom, illuminates ribbon tails and petal contours)
    const rimLight = new THREE.DirectionalLight(0xfbcfe8, 0.9);
    rimLight.position.set(0, -6, -14);
    this.scene.add(rimLight);

    // 6. Build Scene Objects
    this.buildBouquet();
    this.buildAmbientStarfield();
    this.buildFireflies();

    this.scene.add(this.bouquetGroup);
    this.scene.add(this.ambientStarsGroup);
    this.scene.add(this.firefliesGroup);

    this.bouquetGroup.position.set(0, -0.6, 0);

    // 7. Event Listeners
    window.addEventListener('resize', this.onWindowResize.bind(this));
    this.renderer.domElement.addEventListener('pointerdown', this.onPointerDown.bind(this));

    // 8. Start Loop
    this.animate();
  }

  // ====================================================================
  // BUILD BOUQUET: ROSES + FLORIST WRAP + FLAT SATIN PINK BOW
  // ====================================================================
  buildBouquet() {
    this.bouquetGroup.clear();

    // 1. Arrange 12 Lush Blooming Roses forming a rich, tight round dome
    // [x, y, z, scale, rotX, rotY, rotZ]
    const roseArrangement = [
      // Top Center King Rose
      { x: 0, y: 3.8, z: 0, scale: 1.15, rx: 0, ry: 0, rz: 0 },

      // Inner Ring (5 Roses tightly surrounding center)
      { x: 1.8, y: 3.3, z: 0.9, scale: 1.0, rx: 0.28, ry: 0.25, rz: -0.25 },
      { x: -1.8, y: 3.3, z: 0.9, scale: 1.0, rx: 0.28, ry: -0.25, rz: 0.25 },
      { x: 1.9, y: 3.2, z: -1.1, scale: 0.98, rx: -0.28, ry: 0.3, rz: -0.3 },
      { x: -1.9, y: 3.2, z: -1.1, scale: 0.98, rx: -0.28, ry: -0.3, rz: 0.3 },
      { x: 0, y: 3.1, z: 2.0, scale: 1.02, rx: 0.38, ry: 0, rz: 0 },
      { x: 0, y: 3.0, z: -1.9, scale: 0.96, rx: -0.38, ry: 0, rz: 0 },

      // Outer Ring (6 Roses completing the round floral dome)
      { x: 3.2, y: 2.2, z: 1.2, scale: 0.94, rx: 0.45, ry: 0.45, rz: -0.5 },
      { x: -3.2, y: 2.2, z: 1.2, scale: 0.94, rx: 0.45, ry: -0.45, rz: 0.5 },
      { x: 3.3, y: 2.1, z: -1.2, scale: 0.92, rx: -0.45, ry: 0.5, rz: -0.55 },
      { x: -3.3, y: 2.1, z: -1.2, scale: 0.92, rx: -0.45, ry: -0.5, rz: 0.55 },
      { x: 1.5, y: 2.0, z: 2.8, scale: 0.95, rx: 0.55, ry: 0.2, rz: -0.22 },
      { x: -1.5, y: 2.0, z: 2.8, scale: 0.95, rx: 0.55, ry: -0.2, rz: 0.22 }
    ];

    roseArrangement.forEach((cfg, idx) => {
      const rose = this.createSculptedRose(cfg.scale, idx);
      rose.position.set(cfg.x, cfg.y, cfg.z);
      rose.rotation.set(cfg.rx, cfg.ry, cfg.rz);
      this.bouquetGroup.add(rose);

      // Stems converging inside the wrap
      this.createStem(new THREE.Vector3(cfg.x, cfg.y - 0.5, cfg.z), new THREE.Vector3(0, -3.8, 0));
    });

    // 2. Baby's Breath & Starlight Pearls
    this.createBabysBreath();

    // 3. Realistic Korean/French Florist Wrapping Paper (Fluted chalice + origami folds)
    this.createFloristWrapping();

    // 4. Flat Satin Pink Ribbon & Bow (🎀)
    this.createFlatSatinBow();
  }

  // ====================================================================
  // CREATE SCULPTED 3D ROSE: SOFT VELVETY CURVED PETALS
  // ====================================================================
  createSculptedRose(scale = 1.0, seed = 0) {
    const rose = new THREE.Group();

    // Generates an anatomically authentic curved petal mesh
    // Smooth parabolic curve with rolled rim and cupped spoon belly
    const createPetalMesh = (width, length, cupDepth, rollRim, colorHex, roughness = 0.38) => {
      const segU = 16;
      const segV = 16;
      const geom = new THREE.PlaneGeometry(width, length, segU, segV);
      const pos = geom.attributes.position;

      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        const u = x / (width * 0.5);           // -1 to 1 across width
        const v = (y + length * 0.5) / length;  // 0 (base) to 1 (petal tip)

        // Organic heart/oval petal outline
        const taper = Math.sin(Math.pow(v, 0.5) * Math.PI);
        const newX = x * Math.max(0.18, taper);

        // Cupped spherical curvature (spoon shape)
        const zCup = -cupDepth * (1 - u * u) * Math.sin(v * Math.PI);

        // Rolled petal tip curling backwards gracefully
        const zCurl = rollRim * Math.pow(v, 2.4);

        pos.setX(i, newX);
        pos.setZ(i, zCup + zCurl);
      }
      geom.computeVertexNormals();

      const mat = new THREE.MeshStandardMaterial({
        color: colorHex,
        side: THREE.DoubleSide,
        roughness: roughness,
        metalness: 0.04
      });

      return new THREE.Mesh(geom, mat);
    };

    // Layer 1: Core spiral bud (tightly wound 4 inner petals)
    for (let i = 0; i < 4; i++) {
      const ang = (i / 4) * Math.PI * 2 + seed;
      const petal = createPetalMesh(1.1 * scale, 1.5 * scale, 0.45 * scale, 0.12 * scale, this.colors.roseCore);
      petal.position.set(Math.cos(ang) * 0.18 * scale, 0.2 * scale, Math.sin(ang) * 0.18 * scale);
      petal.rotation.y = -ang + Math.PI / 2;
      petal.rotation.x = 0.38;
      rose.add(petal);
    }

    // Layer 2: Inner blooming whorl (5 curved cup petals)
    for (let i = 0; i < 5; i++) {
      const ang = (i / 5) * Math.PI * 2 + 0.3 + seed;
      const petal = createPetalMesh(1.5 * scale, 1.8 * scale, 0.6 * scale, 0.25 * scale, this.colors.roseInner);
      petal.position.set(Math.cos(ang) * 0.42 * scale, 0.12 * scale, Math.sin(ang) * 0.42 * scale);
      petal.rotation.y = -ang + Math.PI / 2;
      petal.rotation.x = 0.55;
      rose.add(petal);
    }

    // Layer 3: Middle layer (6 voluptuous cup petals)
    for (let i = 0; i < 6; i++) {
      const ang = (i / 6) * Math.PI * 2 + 0.6 + seed;
      const petal = createPetalMesh(2.0 * scale, 2.2 * scale, 0.7 * scale, 0.42 * scale, this.colors.roseMid);
      petal.position.set(Math.cos(ang) * 0.75 * scale, 0.0, Math.sin(ang) * 0.75 * scale);
      petal.rotation.y = -ang + Math.PI / 2;
      petal.rotation.x = 0.78;
      rose.add(petal);
    }

    // Layer 4: Outer flared layer (7 blooming petals with rolled edges)
    for (let i = 0; i < 7; i++) {
      const ang = (i / 7) * Math.PI * 2 + 0.2 + seed;
      const petal = createPetalMesh(2.5 * scale, 2.6 * scale, 0.75 * scale, 0.6 * scale, this.colors.roseOuter);
      petal.position.set(Math.cos(ang) * 1.1 * scale, -0.12 * scale, Math.sin(ang) * 1.1 * scale);
      petal.rotation.y = -ang + Math.PI / 2;
      petal.rotation.x = 1.0;
      rose.add(petal);
    }

    // Sepals: 5 green calyx leaves at base
    for (let i = 0; i < 5; i++) {
      const ang = (i / 5) * Math.PI * 2 + 0.1;
      const sepal = createPetalMesh(0.5 * scale, 1.6 * scale, 0.15 * scale, 0.3 * scale, this.colors.leafDeep, 0.6);
      sepal.position.set(Math.cos(ang) * 0.55 * scale, -0.4 * scale, Math.sin(ang) * 0.55 * scale);
      sepal.rotation.y = -ang + Math.PI / 2;
      sepal.rotation.x = 1.6;
      rose.add(sepal);
    }

    // Starlight Dew Accents (Delicate diamond sparkles on petal tips)
    const dewCount = 20;
    const dewPos = new Float32Array(dewCount * 3);
    for (let i = 0; i < dewCount; i++) {
      const r = (Math.random() * 1.6 + 0.4) * scale;
      const th = Math.random() * Math.PI * 2;
      const y = (Math.random() * 0.7) * scale;
      dewPos[i * 3] = Math.cos(th) * r;
      dewPos[i * 3 + 1] = y;
      dewPos[i * 3 + 2] = Math.sin(th) * r;
    }
    const dewGeom = new THREE.BufferGeometry();
    dewGeom.setAttribute('position', new THREE.BufferAttribute(dewPos, 3));
    const dewMat = new THREE.PointsMaterial({
      size: 0.8 * scale,
      map: this.starTexture,
      color: 0xffffff,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    rose.add(new THREE.Points(dewGeom, dewMat));

    return rose;
  }

  // Realistic stem curve
  createStem(startPos, endPos) {
    const midPos = new THREE.Vector3().addVectors(startPos, endPos).multiplyScalar(0.5);
    midPos.x += (Math.random() - 0.5) * 0.3;
    midPos.z += (Math.random() - 0.5) * 0.3;

    const curve = new THREE.QuadraticBezierCurve3(startPos, midPos, endPos);
    const geom = new THREE.TubeGeometry(curve, 10, 0.09, 6, false);
    const mat = new THREE.MeshStandardMaterial({ color: this.colors.leafDeep, roughness: 0.6 });
    this.bouquetGroup.add(new THREE.Mesh(geom, mat));
  }

  // Baby's breath starlight clusters
  createBabysBreath() {
    const clusterCoords = [
      { x: 1.2, y: 3.5, z: 1.5 },
      { x: -1.2, y: 3.5, z: 1.5 },
      { x: 1.6, y: 2.8, z: 2.4 },
      { x: -1.6, y: 2.8, z: 2.4 },
      { x: 2.6, y: 2.6, z: 0.3 },
      { x: -2.6, y: 2.6, z: 0.3 },
      { x: 1.4, y: 3.0, z: -2.2 },
      { x: -1.4, y: 3.0, z: -2.2 },
      { x: 0, y: 2.4, z: 3.4 }
    ];

    clusterCoords.forEach(pos => {
      const count = 14;
      const positions = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        positions[i * 3] = pos.x + (Math.random() - 0.5) * 1.1;
        positions[i * 3 + 1] = pos.y + (Math.random() - 0.5) * 0.9;
        positions[i * 3 + 2] = pos.z + (Math.random() - 0.5) * 1.1;
      }
      const geom = new THREE.BufferGeometry();
      geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const mat = new THREE.PointsMaterial({
        size: 1.4,
        map: this.starTexture,
        color: 0xf0fdf4,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      this.bouquetGroup.add(new THREE.Points(geom, mat));
    });
  }

  // ====================================================================
  // AUTHENTIC KOREAN/FRENCH FLORIST WRAPPING PAPER
  // - Fluted chalice shape: cups flowers naturally, flared at top (r=6.2), cinched at waist (r=1.5 at y=-1.5)
  // - Layered angular folded origami sheets with elegant gold piping
  // - Soft luxury slate navy matte finish (NEVER pitch black!)
  // ====================================================================
  createFloristWrapping() {
    const wrapGroup = new THREE.Group();

    // Materials
    const slatePaperMat = new THREE.MeshStandardMaterial({
      color: this.colors.paperOuter,
      roughness: 0.65,
      metalness: 0.12,
      side: THREE.DoubleSide
    });

    const frostInnerMat = new THREE.MeshStandardMaterial({
      color: this.colors.paperInner,
      roughness: 0.5,
      metalness: 0.05,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85
    });

    const goldTrimMat = new THREE.MeshStandardMaterial({
      color: this.colors.goldEdge,
      metalness: 0.85,
      roughness: 0.2,
      side: THREE.DoubleSide
    });

    // 1. Core Supportive Fluted Chalice (Smooth organic vase shape holding the flowers)
    // Points from waist y=-1.5 (r=1.5) curving outward to rim y=2.2 (r=5.8)
    const chalicePoints = [];
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      const y = -1.5 + t * 3.7; // -1.5 to 2.2
      // Natural flared curve
      const r = 1.5 + Math.pow(t, 1.4) * 4.3;
      chalicePoints.push(new THREE.Vector2(r, y));
    }
    const chaliceGeom = new THREE.LatheGeometry(chalicePoints, 32);
    const chaliceMesh = new THREE.Mesh(chaliceGeom, frostInnerMat);
    wrapGroup.add(chaliceMesh);

    // 2. Layered Outer Origami Paper Sheets (Korean Style Folded Sheets with Gold Piping)
    // 6 distinct stylish overlapping folded sheets framing the bouquet
    const sheetConfigs = [
      // Back Tall Wing Sheets (Rise behind flowers)
      { angle: Math.PI * 0.8, span: 1.4, yTop: 3.8, rTop: 6.8, isBack: true },
      { angle: Math.PI * 1.2, span: 1.4, yTop: 3.8, rTop: 6.8, isBack: true },
      { angle: Math.PI, span: 1.2, yTop: 4.2, rTop: 7.0, isBack: true },
      // Side Flared Wings
      { angle: Math.PI * 0.35, span: 1.3, yTop: 3.0, rTop: 6.5, isBack: false },
      { angle: -Math.PI * 0.35, span: 1.3, yTop: 3.0, rTop: 6.5, isBack: false },
      // Front Elegant Folded Lapel
      { angle: 0, span: 1.5, yTop: 2.2, rTop: 5.6, isBack: false }
    ];

    sheetConfigs.forEach(cfg => {
      const segU = 12;
      const segV = 12;
      const sheetGeom = new THREE.PlaneGeometry(1, 1, segU, segV);
      const pos = sheetGeom.attributes.position;

      for (let i = 0; i < pos.count; i++) {
        const u = pos.getX(i) + 0.5; // 0 to 1 across width
        const v = pos.getY(i) + 0.5; // 0 to 1 along height

        const currentY = -1.5 + v * (cfg.yTop - (-1.5));
        const currentR = 1.52 + Math.pow(v, 1.2) * (cfg.rTop - 1.52);

        const currentAng = cfg.angle - (cfg.span * 0.5) + u * cfg.span;

        // Elegant origami center crease
        const crease = Math.sin(u * Math.PI) * 0.35 * v;

        const x = Math.cos(currentAng) * (currentR + crease);
        const z = Math.sin(currentAng) * (currentR + crease);

        pos.setXYZ(i, x, currentY, z);
      }
      sheetGeom.computeVertexNormals();

      const sheetMesh = new THREE.Mesh(sheetGeom, slatePaperMat);
      wrapGroup.add(sheetMesh);

      // Gold Foil Trim along the top edge of each sheet
      const topEdgePts = [];
      for (let j = 0; j <= 12; j++) {
        const u = j / 12;
        const currentR = cfg.rTop + Math.sin(u * Math.PI) * 0.35;
        const currentAng = cfg.angle - (cfg.span * 0.5) + u * cfg.span;
        topEdgePts.push(new THREE.Vector3(
          Math.cos(currentAng) * currentR,
          cfg.yTop,
          Math.sin(currentAng) * currentR
        ));
      }
      const edgeCurve = new THREE.CatmullRomCurve3(topEdgePts);
      const edgeTubeGeom = new THREE.TubeGeometry(edgeCurve, 16, 0.05, 6, false);
      const edgeMesh = new THREE.Mesh(edgeTubeGeom, goldTrimMat);
      wrapGroup.add(edgeMesh);
    });

    // 3. Lower Handle Wrap (Wrapped paper cylinder around the stems below the waist)
    // From waist y=-1.5 (r=1.5) down to y=-4.6 (r=1.1)
    const handleGeom = new THREE.CylinderGeometry(1.5, 1.15, 3.1, 32, 4, true);
    handleGeom.translate(0, -3.05, 0);
    const handleMesh = new THREE.Mesh(handleGeom, slatePaperMat);
    wrapGroup.add(handleMesh);

    // Stem ends peeking out cleanly below the wrap
    const stemEndGeom = new THREE.CylinderGeometry(0.85, 0.8, 0.7, 16);
    stemEndGeom.translate(0, -4.7, 0);
    const stemEndMat = new THREE.MeshStandardMaterial({ color: this.colors.leafDeep, roughness: 0.6 });
    wrapGroup.add(new THREE.Mesh(stemEndGeom, stemEndMat));

    this.bouquetGroup.add(wrapGroup);
  }

  // ====================================================================
  // CUTE FLAT SATIN PINK RIBBON & BOW (🎀)
  // Anatomically realistic flat ribbon fabric:
  // - Flat rectangular satin ribbon tape (NOT round macaroni pipes!)
  // - Realistic cinched center knot
  // - Graceful teardrop ribbon loops
  // - Flowing flat ribbon tails with swallowtail inverted-V notches
  // - Tied prominently on the outside at waist (y=-1.5, z=1.8), NO CLIPPING!
  // ====================================================================
  createFlatSatinBow() {
    const bowGroup = new THREE.Group();

    const waistY = -1.5;
    const waistZ = 1.65; // Positioned securely in front of the wrap

    const satinMat = new THREE.MeshStandardMaterial({
      color: this.colors.ribbonPink,
      roughness: 0.26,
      metalness: 0.16,
      side: THREE.DoubleSide
    });

    // 1. Satin Ribbon Waistband wrapped around the cinched paper
    const bandGeom = new THREE.CylinderGeometry(1.56, 1.54, 0.7, 32, 1, true);
    const band = new THREE.Mesh(bandGeom, satinMat);
    band.position.set(0, waistY, 0);
    bowGroup.add(band);

    // 2. Center Bow Knot (Soft rectangular fabric band wrapping the center)
    const knotGeom = new THREE.BoxGeometry(0.8, 0.65, 0.5);
    const knot = new THREE.Mesh(knotGeom, satinMat);
    knot.position.set(0, waistY, waistZ + 0.2);
    knot.rotation.y = 0;
    bowGroup.add(knot);

    // 3. Flat Satin Ribbon Loops (Realistic teardrop ribbon loops)
    // Created as flat ribbon strips (Plane / Extruded flat ribbon)
    const createFlatLoop = (side = 1) => {
      // Loop curve from center knot, ballooning outward and returning
      const p0 = new THREE.Vector3(side * 0.3, waistY, waistZ + 0.15);
      const p1 = new THREE.Vector3(side * 1.6, waistY + 0.85, waistZ + 0.6);
      const p2 = new THREE.Vector3(side * 2.1, waistY - 0.25, waistZ + 0.55);
      const p3 = new THREE.Vector3(side * 0.3, waistY - 0.05, waistZ + 0.15);

      const loopCurve = new THREE.CubicBezierCurve3(p0, p1, p2, p3);
      const pts = loopCurve.getPoints(24);

      // Generate flat ribbon strip along the curve
      const ribbonWidth = 0.55;
      const geom = new THREE.PlaneGeometry(1, 1, 24, 1);
      const pos = geom.attributes.position;

      pts.forEach((pt, idx) => {
        // Vertex top and bottom along the ribbon width
        pos.setXYZ(idx * 2, pt.x, pt.y + ribbonWidth * 0.5, pt.z);
        pos.setXYZ(idx * 2 + 1, pt.x, pt.y - ribbonWidth * 0.5, pt.z);
      });
      geom.computeVertexNormals();

      return new THREE.Mesh(geom, satinMat);
    };

    bowGroup.add(createFlatLoop(1));  // Right loop
    bowGroup.add(createFlatLoop(-1)); // Left loop

    // 4. Flowing Satin Ribbon Tails (Flat satin ribbon with natural flutter and swallowtail cut)
    const createFlatTail = (side = 1) => {
      const p0 = new THREE.Vector3(side * 0.2, waistY - 0.1, waistZ + 0.2);
      const p1 = new THREE.Vector3(side * 0.8, waistY - 1.2, waistZ + 0.4);
      const p2 = new THREE.Vector3(side * 0.4, waistY - 2.4, waistZ + 0.35);
      const p3 = new THREE.Vector3(side * 1.0, waistY - 3.8, waistZ + 0.3);

      const tailCurve = new THREE.CubicBezierCurve3(p0, p1, p2, p3);
      const pts = tailCurve.getPoints(24);

      const ribbonWidth = 0.52;
      const geom = new THREE.PlaneGeometry(1, 1, 24, 1);
      const pos = geom.attributes.position;

      pts.forEach((pt, idx) => {
        pos.setXYZ(idx * 2, pt.x - ribbonWidth * 0.5, pt.y, pt.z);
        pos.setXYZ(idx * 2 + 1, pt.x + ribbonWidth * 0.5, pt.y, pt.z);
      });
      geom.computeVertexNormals();

      return new THREE.Mesh(geom, satinMat);
    };

    bowGroup.add(createFlatTail(1));  // Right tail
    bowGroup.add(createFlatTail(-1)); // Left tail

    this.bouquetGroup.add(bowGroup);
  }

  // ====================================================================
  // AMBIENT STARFIELD & FIREFLIES
  // ====================================================================
  buildAmbientStarfield() {
    this.ambientStarsGroup.clear();

    const count = 1500;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const r = 35 + Math.random() * 80;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      const rnd = Math.random();
      const col = rnd > 0.4 ? new THREE.Color(0xffffff) : new THREE.Color(0x7dd3fc);
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 1.4,
      map: this.starTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.ambientStarsGroup.add(new THREE.Points(geometry, material));
  }

  buildFireflies() {
    this.firefliesGroup.clear();

    const count = 65;
    const positions = new Float32Array(count * 3);
    this.fireflyVelocities = [];

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 16;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 16;

      this.fireflyVelocities.push({
        x: (Math.random() - 0.5) * 0.015,
        y: (Math.random() - 0.5) * 0.015 + 0.005,
        z: (Math.random() - 0.5) * 0.015,
        phase: Math.random() * Math.PI * 2
      });
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      size: 2.2,
      map: this.starTexture,
      color: 0x7dd3fc,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.fireflyPoints = new THREE.Points(geom, mat);
    this.firefliesGroup.add(this.fireflyPoints);
  }

  // ====================================================================
  // SHOOTING STARS & HEART BURST
  // ====================================================================
  triggerShootingStar() {
    const startX = (Math.random() - 0.5) * 35;
    const startY = 18 + Math.random() * 8;
    const startZ = -8 + (Math.random() - 0.5) * 16;

    const points = [];
    for (let i = 0; i < 12; i++) {
      points.push(new THREE.Vector3(startX, startY, startZ));
    }

    const geom = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({
      color: 0xfbcfe8,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending
    });

    const meteorLine = new THREE.Line(geom, mat);
    this.scene.add(meteorLine);

    this.shootingStars.push({
      mesh: meteorLine,
      pos: new THREE.Vector3(startX, startY, startZ),
      velocity: new THREE.Vector3(-1.4, -0.9, 0.25),
      trail: points,
      life: 1.0
    });
  }

  triggerHeartBurst(screenX, screenY) {
    const burstCount = 45;
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(burstCount * 3);
    const velocities = [];

    const vec = new THREE.Vector3(
      (screenX / window.innerWidth) * 2 - 1,
      -(screenY / window.innerHeight) * 2 + 1,
      0.5
    );
    vec.unproject(this.camera);
    vec.sub(this.camera.position).normalize();
    const spawnPos = new THREE.Vector3().copy(this.camera.position).add(vec.multiplyScalar(24));

    for (let i = 0; i < burstCount; i++) {
      const t = (i / burstCount) * Math.PI * 2;
      const hx = 16 * Math.pow(Math.sin(t), 3) * 0.085;
      const hy = (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * 0.085;

      positions[i * 3] = spawnPos.x;
      positions[i * 3 + 1] = spawnPos.y;
      positions[i * 3 + 2] = spawnPos.z;

      velocities.push(new THREE.Vector3(hx * 0.12, hy * 0.12, (Math.random() - 0.5) * 0.3));
    }

    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      size: 2.6,
      map: this.starTexture,
      color: 0xf472b6,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const heartPoints = new THREE.Points(geom, mat);
    this.scene.add(heartPoints);

    this.allParticleSystems.push({
      mesh: heartPoints,
      velocities,
      life: 1.0,
      decay: 0.025
    });
  }

  onPointerDown(event) {
    this.pointerDownX = event.clientX;
    this.pointerDownY = event.clientY;

    const onPointerUp = (upEvent) => {
      window.removeEventListener('pointerup', onPointerUp);
      const dist = Math.hypot(upEvent.clientX - this.pointerDownX, upEvent.clientY - this.pointerDownY);
      if (dist < 6) {
        this.triggerHeartBurst(upEvent.clientX, upEvent.clientY);
        this.triggerShootingStar();
        if (window.romanticAudio) {
          window.romanticAudio.playCelestialBurst();
        }
        if (window.showRomanticWhisper) {
          window.showRomanticWhisper();
        }
      }
    };
    window.addEventListener('pointerup', onPointerUp);
  }

  onWindowResize() {
    if (!this.container || !this.camera || !this.renderer) return;
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  // ====================================================================
  // MAIN ANIMATION LOOP
  // ====================================================================
  animate() {
    this.animationId = requestAnimationFrame(this.animate.bind(this));

    const elapsedTime = this.clock.getElapsedTime();

    // 1. Gentle Floating of Bouquet
    if (this.bouquetGroup) {
      const breath = Math.sin(elapsedTime * 1.2) * 0.15;
      this.bouquetGroup.position.y = -0.6 + breath;
      this.bouquetGroup.rotation.z = Math.sin(elapsedTime * 0.5) * 0.012;
    }

    // 2. Fireflies physics
    if (this.fireflyPoints) {
      const posAttr = this.fireflyPoints.geometry.attributes.position;
      for (let i = 0; i < this.fireflyVelocities.length; i++) {
        const vel = this.fireflyVelocities[i];
        posAttr.array[i * 3] += vel.x + Math.sin(elapsedTime + vel.phase) * 0.01;
        posAttr.array[i * 3 + 1] += vel.y + Math.cos(elapsedTime + vel.phase) * 0.01;
        posAttr.array[i * 3 + 2] += vel.z;

        if (posAttr.array[i * 3 + 1] > 9) posAttr.array[i * 3 + 1] = -7;
        if (posAttr.array[i * 3] > 10) posAttr.array[i * 3] = -10;
        if (posAttr.array[i * 3] < -10) posAttr.array[i * 3] = 10;
      }
      posAttr.needsUpdate = true;
    }

    // 3. Shooting Stars update
    for (let i = this.shootingStars.length - 1; i >= 0; i--) {
      const star = this.shootingStars[i];
      star.pos.add(star.velocity);
      star.trail.unshift(star.pos.clone());
      star.trail.pop();
      star.mesh.geometry.setFromPoints(star.trail);

      star.life -= 0.025;
      star.mesh.material.opacity = star.life;

      if (star.life <= 0) {
        this.scene.remove(star.mesh);
        star.mesh.geometry.dispose();
        star.mesh.material.dispose();
        this.shootingStars.splice(i, 1);
      }
    }

    if (Math.random() < 0.007) {
      this.triggerShootingStar();
    }

    // 4. Particle systems update
    for (let i = this.allParticleSystems.length - 1; i >= 0; i--) {
      const sys = this.allParticleSystems[i];
      const posAttr = sys.mesh.geometry.attributes.position;
      const count = sys.velocities.length;

      for (let j = 0; j < count; j++) {
        posAttr.array[j * 3] += sys.velocities[j].x;
        posAttr.array[j * 3 + 1] += sys.velocities[j].y;
        posAttr.array[j * 3 + 2] += sys.velocities[j].z;
      }
      posAttr.needsUpdate = true;

      sys.life -= sys.decay;
      sys.mesh.material.opacity = sys.life;

      if (sys.life <= 0) {
        this.scene.remove(sys.mesh);
        sys.mesh.geometry.dispose();
        sys.mesh.material.dispose();
        this.allParticleSystems.splice(i, 1);
      }
    }

    // 5. Slowly rotate ambient starfield
    if (this.ambientStarsGroup) {
      this.ambientStarsGroup.rotation.y = elapsedTime * 0.01;
    }

    // 6. Controls & Render
    if (this.controls) {
      this.controls.update();
    }

    this.renderer.render(this.scene, this.camera);
  }

  captureScreenshot() {
    this.renderer.render(this.scene, this.camera);
    const dataUrl = this.renderer.domElement.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'bo-hoa-sao-tang-em-20-11.png';
    link.href = dataUrl;
    link.click();
  }
}

window.CelestialBouquet = CelestialBouquet;
