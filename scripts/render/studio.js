// The photographic studio every demonstration render shares: one stone
// surface, one key light from the upper left, one set of softboxes in the
// reflections. Keeping these fixed is what makes the catalogue read as one
// shoot instead of a collage.
import * as THREE from 'three';

// Physically based metal colours (linear sRGB reflectance at normal incidence).
export const METALS = {
  '24': new THREE.Color(1.0, 0.74, 0.30),
  '22': new THREE.Color(1.0, 0.76, 0.36),
  '21': new THREE.Color(0.99, 0.78, 0.42),
  '18': new THREE.Color(1.0, 0.79, 0.47),
  white: new THREE.Color(0.86, 0.85, 0.83),
};

export function gold(karat = '22', { roughness = 0.14, ...rest } = {}) {
  return new THREE.MeshPhysicalMaterial({
    color: METALS[karat],
    metalness: 1,
    roughness,
    clearcoat: 0.25,
    clearcoatRoughness: 0.08,
    envMapIntensity: 1.0,
    ...rest,
  });
}

export function diamond() {
  return new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0,
    roughness: 0,
    transmission: 1,
    thickness: 0.4,
    ior: 2.42,
    dispersion: 3,
    specularIntensity: 1,
    envMapIntensity: 2.2,
    flatShading: true,
  });
}

export function gem(color, { attenuation = color, distance = 0.35 } = {}) {
  return new THREE.MeshPhysicalMaterial({
    color,
    metalness: 0,
    roughness: 0.02,
    transmission: 0.92,
    thickness: 0.6,
    ior: 1.58,
    attenuationColor: new THREE.Color(attenuation),
    attenuationDistance: distance,
    envMapIntensity: 1.8,
    flatShading: true,
  });
}

export function pearl() {
  return new THREE.MeshPhysicalMaterial({
    color: 0xeee5d6,
    roughness: 0.16,
    sheen: 0.6,
    sheenColor: new THREE.Color(0xf2d6cc),
    sheenRoughness: 0.3,
    iridescence: 0.7,
    iridescenceIOR: 1.6,
    clearcoat: 1,
    clearcoatRoughness: 0.15,
  });
}

// Reflection environment: a dim warm room with large softboxes. Gold has no
// colour of its own to show; what you see is these panels, so their shape
// and placement decide how "photographic" the metal looks.
function buildEnvironment(renderer, { warmth = 1 } = {}) {
  const env = new THREE.Scene();
  const room = new THREE.Mesh(
    new THREE.SphereGeometry(50, 32, 16),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(0.045, 0.042, 0.038), side: THREE.BackSide }),
  );
  env.add(room);

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(0.36, 0.345, 0.32) }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -2;
  env.add(floor);

  const panel = (w, h, intensity, pos, look, tint = [1, 0.97, 0.92]) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(tint[0] * intensity, tint[1] * intensity * warmth, tint[2] * intensity * warmth),
        side: THREE.DoubleSide,
      }),
    );
    m.position.set(...pos);
    m.lookAt(...look);
    env.add(m);
  };
  // Key: large, upper left.
  panel(18, 12, 16, [-16, 16, 6], [0, 0, 0]);
  // Overhead strip.
  panel(26, 4, 8, [0, 22, -2], [0, 0, 0]);
  // Fill: long vertical strip on the right.
  panel(4, 20, 3.2, [18, 6, 4], [0, 0, 0]);
  // Rim from behind.
  panel(22, 3, 4, [0, 8, -20], [0, 0, 0], [1, 0.93, 0.85]);
  // Low, wide bounce card in front: lifts the near side of rings and bangles.
  panel(30, 5, 2.2, [0, 1, 22], [0, 2, 0]);
  // A small bright card front-left, for a crisp highlight.
  panel(4, 4, 7, [-8, 5, 16], [0, 0, 0]);

  const pmrem = new THREE.PMREMGenerator(renderer);
  const tex = pmrem.fromScene(env, 0.035).texture;
  pmrem.dispose();
  return tex;
}

// Limestone: fine multi-scale grain baked into a canvas texture.
function stoneTexture(base = [240, 236, 228], size = 1024, seed = 3) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  const img = g.createImageData(size, size);
  let s = seed;
  const rand = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const grid = (n) => Array.from({ length: (n + 1) * (n + 1) }, rand);
  const layers = [[8, 7], [32, 4], [128, 2.5], [512, 2]].map(([n, amp]) => ({ n, amp, v: grid(n) }));
  const sample = ({ n, v }, x, y) => {
    const fx = (x / size) * n, fy = (y / size) * n;
    const ix = Math.floor(fx), iy = Math.floor(fy);
    const tx = fx - ix, ty = fy - iy;
    const sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty);
    const at = (a, b) => v[(b % n) * (n + 1) + (a % n)];
    const top = at(ix, iy) * (1 - sx) + at(ix + 1, iy) * sx;
    const bot = at(ix, iy + 1) * (1 - sx) + at(ix + 1, iy + 1) * sx;
    return top * (1 - sy) + bot * sy;
  };
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let d = 0;
      for (const l of layers) d += (sample(l, x, y) - 0.5) * l.amp;
      // Rare darker flecks, as in real limestone.
      if (rand() > 0.9985) d -= 10 * rand();
      const i = (y * size + x) * 4;
      img.data[i] = base[0] + d;
      img.data[i + 1] = base[1] + d * 0.96;
      img.data[i + 2] = base[2] + d * 0.9;
      img.data[i + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 8;
  return tex;
}

export function createStudio(canvas, { width, height, pixelRatio = 2, surface = [240, 236, 228], exposure = 1 }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(pixelRatio);
  renderer.setSize(width, height, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = exposure;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  const scene = new THREE.Scene();
  scene.environment = buildEnvironment(renderer);
  scene.environmentIntensity = 1;
  scene.background = new THREE.Color().setRGB(...surface.map((v) => v / 255), THREE.SRGBColorSpace);

  const stone = stoneTexture(surface);
  stone.repeat.set(3, 3);
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(80, 80),
    // envMap is set explicitly: without it three.js ignores envMapIntensity
    // and applies the full studio environment, which burns the floor to white.
    new THREE.MeshStandardMaterial({ map: stone, roughness: 0.92, metalness: 0, envMap: scene.environment, envMapIntensity: 0.12 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  // Key light: a soft spot from the upper left, giving a pool of light and
  // a soft shadow falling to the lower right.
  const key = new THREE.SpotLight(0xfff7ee, 700, 0, Math.PI / 6, 1, 2);
  key.position.set(-9, 16, 7);
  key.target.position.set(0, 0, 0);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.radius = 7;
  key.shadow.bias = -0.0004;
  key.shadow.camera.near = 5;
  key.shadow.camera.far = 40;
  scene.add(key, key.target);

  // Overhead light whose only job is a tight, soft contact shadow, so pieces
  // sit on the stone instead of floating above it.
  const contact = new THREE.DirectionalLight(0xffffff, 0.9);
  contact.position.set(0.6, 20, 0.8);
  contact.castShadow = true;
  contact.shadow.mapSize.set(2048, 2048);
  contact.shadow.radius = 3;
  contact.shadow.bias = -0.0006;
  Object.assign(contact.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16, near: 1, far: 40 });
  scene.add(contact);

  // Very low ambient so the far floor does not drop to black.
  scene.add(new THREE.HemisphereLight(0xfffaf3, 0xdcd6cb, 0.2));

  const camera = new THREE.PerspectiveCamera(22, width / height, 0.1, 200);

  return { renderer, scene, camera, key, contact, floor };
}

export function enableShadows(object) {
  object.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  return object;
}
