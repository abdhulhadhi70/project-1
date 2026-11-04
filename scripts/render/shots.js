// Every image in the demonstration catalogue, as a camera and a piece.
// Similar pieces share a camera so their scale stays comparable.
import * as THREE from 'three';
import {
  band, beadNecklace, bangle, bullionCoin, castBar, chain, coinPendant, drop, floorPath, hoop, kada,
  coinFringe, loopPath, mintedBar, ropeChain, signet, solitaire, stonePendant, stud,
} from './pieces.js';
import { pearl } from './studio.js';

const deg = THREE.MathUtils.degToRad;

// Camera presets: [distance, elevation°, azimuth°, target y, fov]
const CAM = {
  flatlay: [40, 64, 6, 0, 20],
  chainMacro: [17, 50, 14, 0.1, 20],
  ring: [11.5, 24, 18, 0.95, 20],
  ringClose: [7.4, 22, 22, 1.0, 20],
  bangle: [21, 46, 12, 0.4, 22],
  earring: [9, 38, 10, 0.3, 22],
  hoops: [15, 42, 10, 0.3, 22],
  pendant: [11, 58, 6, 0, 22],
  bullion: [11, 50, 12, 0.1, 22],
  bracelet: [21, 54, 10, 0.2, 22],
  studs: [6.2, 40, 10, 0.2, 22],
};

export function placeCamera(camera, [dist, elev, azim, ty, fov], target = [0, 0]) {
  camera.fov = fov;
  const e = deg(elev), a = deg(azim);
  camera.position.set(
    target[0] + Math.sin(a) * Math.cos(e) * dist,
    ty + Math.sin(e) * dist,
    target[1] + Math.cos(a) * Math.cos(e) * dist,
  );
  camera.lookAt(target[0], ty, target[1]);
  camera.updateProjectionMatrix();
}

// Draped paths, in cm on the floor.
const PATH = {
  // A necklace laid as an open teardrop, clasp ends running out of frame.
  necklace: () => floorPath([[-4.2, -12], [-4.5, -6], [-4.3, -1.4], [-3.1, 2], [-1.2, 3.6], [0, 3.85], [1.2, 3.6], [3.1, 2], [4.3, -1.4], [4.5, -6], [4.2, -12]]),
  // A chain in a loose S across the frame.
  s: () => floorPath([[-5, -9], [-2.4, -4.6], [-0.3, -1.6], [0.5, 0.8], [-0.1, 3.2], [1.4, 5.8], [4.2, 9.5]]),
  // A chain spiralling inward from the lower right; it never crosses itself.
  coil: () => {
    const pts = [[7, 9], [4.6, 5.2]];
    for (let i = 0; i <= 90; i++) {
      const t = i / 90;
      const a = -0.3 + t * Math.PI * 2.9;
      const r = 3.4 - t * 2.1;
      pts.push([Math.cos(a) * r, Math.sin(a) * r * 0.9]);
    }
    return floorPath(pts);
  },
  // Pendant chain: a V rising from the bail out of the top of frame.
  pendantV: (bailZ) => floorPath([[-5.5, -11], [-2.4, -5], [-0.55, bailZ - 0.3], [0, bailZ + 0.05], [0.55, bailZ - 0.3], [2.4, -5], [5.5, -11]]),
};

const shot = (id, camera, build, opts = {}) => ({ id, camera, build, ...opts });

export const SHOTS = [
  // ---- Chains ------------------------------------------------------------
  shot('rope-chain-22k-1', CAM.chainMacro, () => ropeChain(PATH.s(), { karat: '22', radius: 0.15 })),
  shot('rope-chain-22k-2', [9, 34, 30, 0.1, 20], () => ropeChain(PATH.s(), { karat: '22', radius: 0.15 }), { target: [0.2, 0.4] }),
  shot('cable-chain-18k-1', CAM.chainMacro, () => chain(PATH.coil(), { karat: '18', length: 0.42, width: 0.28, wire: 0.05 })),
  shot('curb-chain-22k-1', CAM.chainMacro, () => chain(PATH.s(), { karat: '22', style: 'curb', length: 0.72, width: 0.52, wire: 0.11 })),
  shot('curb-chain-22k-2', [8.5, 36, 24, 0.1, 20], () => chain(PATH.s(), { karat: '22', style: 'curb', length: 0.72, width: 0.52, wire: 0.11 }), { target: [0.2, 0.4] }),

  // ---- Necklaces ---------------------------------------------------------
  shot('bead-necklace-22k-1', CAM.flatlay, () => beadNecklace(PATH.necklace(), { karat: '22', diameter: 0.5 }), { target: [0, -1.4] }),
  shot('pearl-gold-necklace-18k-1', CAM.flatlay, () => {
    const g = new THREE.Group();
    const path = PATH.necklace();
    const n = 46;
    const pm = pearl();
    const goldBeads = beadNecklace(path, { karat: '18', diameter: 0.34, gap: 0.42 });
    g.add(goldBeads);
    const p = new THREE.SphereGeometry(0.3, 40, 28);
    for (let i = 0; i < n; i++) {
      const pt = path.getPointAt((i + 0.25) / n);
      const m = new THREE.Mesh(p, pm);
      m.position.set(pt.x, 0.3, pt.z);
      g.add(m);
    }
    return g;
  }, { target: [0, -1.4] }),
  shot('rope-necklace-21k-1', CAM.flatlay, () => ropeChain(PATH.necklace(), { karat: '21', radius: 0.22, twist: 0.8 }), { target: [0, -1.4] }),

  // ---- Rings -------------------------------------------------------------
  shot('solitaire-ring-18k-1', CAM.ring, () => solitaire({ karat: '18', stone: 0.3 })),
  shot('solitaire-ring-18k-2', [6.2, 30, 62, 1.5, 20], () => solitaire({ karat: '18', stone: 0.3 })),
  shot('plain-band-22k-1', CAM.ring, () => {
    const g = new THREE.Group();
    const a = band({ karat: '22', width: 0.5, thickness: 0.18 });
    const b = band({ karat: '22', width: 0.5, thickness: 0.18 });
    b.rotation.y = deg(64);
    b.position.x = 1.5;
    b.position.z = -1.6;
    g.add(a, b);
    return g;
  }),
  shot('signet-ring-21k-1', CAM.ring, () => signet({ karat: '21' })),

  // ---- Earrings ----------------------------------------------------------
  shot('hoop-earrings-22k-1', CAM.hoops, () => {
    const g = new THREE.Group();
    const a = hoop({ karat: '22' });
    a.rotation.x = -Math.PI / 2;
    a.position.set(-0.75, 0.17, 0.75);
    const b = hoop({ karat: '22' });
    b.rotation.x = -Math.PI / 2;
    b.rotation.z = deg(40);
    b.position.set(0.85, 0.17, -0.85);
    g.add(a, b);
    return g;
  }),
  shot('drop-earrings-22k-1', CAM.earring, () => {
    const g = new THREE.Group();
    for (const [x, z, r] of [[-0.75, 0.3, 12], [0.75, -0.3, -8]]) {
      const d = drop({ karat: '22' });
      d.rotation.x = -Math.PI / 2;
      d.rotation.z = deg(r);
      d.position.set(x, 0.3, z);
      g.add(d);
    }
    return g;
  }),
  shot('pearl-drop-earrings-18k-1', CAM.earring, () => {
    const g = new THREE.Group();
    for (const [x, z, r] of [[-0.75, 0.2, 8], [0.75, -0.2, -14]]) {
      const d = drop({ karat: '18', withPearl: true });
      d.rotation.x = -Math.PI / 2;
      d.rotation.z = deg(r);
      d.position.set(x, 0.27, z);
      g.add(d);
    }
    return g;
  }),

  // ---- Pendants ----------------------------------------------------------
  shot('coin-pendant-22k-1', CAM.pendant, () => {
    const g = new THREE.Group();
    g.add(coinPendant({ karat: '22' }));
    g.add(chain(PATH.pendantV(-1.13), { karat: '22', length: 0.3, width: 0.2, wire: 0.04 }));
    return g;
  }),
  shot('emerald-pendant-18k-1', CAM.pendant, () => {
    const g = new THREE.Group();
    g.add(stonePendant({ karat: '18' }));
    g.add(chain(PATH.pendantV(-0.78), { karat: '18', length: 0.26, width: 0.18, wire: 0.035 }));
    return g;
  }),

  // ---- Bangles -----------------------------------------------------------
  shot('plain-bangles-22k-1', CAM.bangle, () => {
    const g = new THREE.Group();
    const a = bangle({ karat: '22' });
    a.rotation.x = -Math.PI / 2;
    a.position.y = 0.15;
    const b = bangle({ karat: '22' });
    b.rotation.x = -Math.PI / 2 + deg(14);
    b.position.set(2.2, 0.95, -1.4);
    g.add(a, b);
    return g;
  }),
  shot('kada-bangle-22k-1', CAM.bangle, () => {
    const k = kada({ karat: '22' });
    k.rotation.x = -Math.PI / 2;
    k.position.y = 0.29;
    return k;
  }),

  // ---- Coins & bars ------------------------------------------------------
  shot('minted-bar-10g-24k-1', CAM.bullion, () => {
    const b = mintedBar({ w: 1.6, l: 2.7 });
    b.rotation.y = deg(-14);
    return b;
  }),
  shot('minted-bar-1oz-24k-1', [14, 50, 12, 0.1, 22], () => {
    const b = mintedBar({ w: 2.4, l: 4.1, h: 0.18 });
    b.rotation.y = deg(18);
    return b;
  }),
  shot('minted-bars-5g-24k-1', CAM.bullion, () => {
    const g = new THREE.Group();
    const a = mintedBar({ w: 1.25, l: 2.1, h: 0.1 });
    a.position.set(-0.75, 0, 0.3);
    a.rotation.y = deg(-8);
    const b = mintedBar({ w: 1.25, l: 2.1, h: 0.1 });
    b.position.set(0.8, 0, -0.35);
    b.rotation.y = deg(12);
    g.add(a, b);
    return g;
  }),
  shot('tt-bar-24k-1', [15, 34, 28, 0.35, 22], () => {
    const b = castBar();
    b.rotation.y = deg(-22);
    return b;
  }),
  shot('bullion-coin-22k-1', CAM.bullion, () => bullionCoin({ karat: '22', radius: 1.1 })),
  shot('bullion-coins-24k-1', CAM.bullion, () => {
    const g = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      const c = bullionCoin({ karat: '24', radius: 1.0, thickness: 0.11 });
      c.position.set(-0.9 + i * 0.05, i * 0.112, 0.4 - i * 0.04);
      c.rotation.y = deg(i * 17);
      g.add(c);
    }
    const lean = bullionCoin({ karat: '24', radius: 1.0, thickness: 0.11, points: 12 });
    lean.position.set(1.2, 0.02, -0.6);
    g.add(lean);
    return g;
  }),

  // ---- Bridal ------------------------------------------------------------
  shot('bridal-collar-22k-1', CAM.flatlay, () => {
    const g = new THREE.Group();
    const path = PATH.necklace();
    g.add(beadNecklace(path, { karat: '22', diameter: 0.36, gap: 0.02 }));
    g.add(coinFringe(path, { karat: '22', count: 19, from: 0.31, to: 0.69, radius: 0.36 }));
    return g;
  }, { target: [0, -1.0] }),
  shot('layered-necklace-22k-1', CAM.flatlay, () => {
    const g = new THREE.Group();
    g.add(ropeChain(PATH.necklace(), { karat: '22', radius: 0.15, twist: 0.6 }));
    const outer = floorPath([[-5.2, -12], [-5.6, -6], [-5.5, -1], [-4.2, 3.2], [-1.6, 5.4], [0, 5.75], [1.6, 5.4], [4.2, 3.2], [5.5, -1], [5.6, -6], [5.2, -12]]);
    g.add(chain(outer, { karat: '22', length: 0.34, width: 0.24, wire: 0.05 }));
    return g;
  }, { target: [0, -0.4] }),
  shot('haram-necklace-22k-1', [46, 66, 6, 0, 20], () => {
    const g = new THREE.Group();
    const path = floorPath([[-4.6, -13], [-5.2, -6], [-5.0, 0], [-3.6, 4.6], [-1.3, 6.9], [-0.35, 7.2], [0.35, 7.2], [1.3, 6.9], [3.6, 4.6], [5.0, 0], [5.2, -6], [4.6, -13]]);
    g.add(beadNecklace(path, { karat: '22', diameter: 0.42, gap: 0.03 }));
    const c = coinPendant({ karat: '22', radius: 1.1 });
    c.rotation.y = Math.PI;
    c.position.set(0, 0, 8.55);
    g.add(c);
    return g;
  }, { target: [0, 2.6] }),
  shot('bridal-bangle-stack-22k-1', CAM.bangle, () => {
    const g = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      const b = bangle({ karat: '22', tube: 0.16 });
      b.rotation.x = -Math.PI / 2;
      b.position.set(-0.35 + i * 0.25, 0.12 + i * 0.25, 0.3 - i * 0.22);
      b.rotation.y = deg(i * 3 - 4);
      g.add(b);
    }
    return g;
  }),

  // ---- Men -----------------------------------------------------------------
  shot('mens-curb-bracelet-22k-1', CAM.bracelet, () =>
    chain(loopPath(3.3, 2.7, 0.06, 2), { karat: '22', style: 'curb', length: 0.78, width: 0.56, wire: 0.12 })),
  shot('mens-band-21k-1', CAM.ring, () => band({ karat: '21', inner: 1.0, width: 0.72, thickness: 0.22, flatTop: true })),
  shot('mens-rope-chain-21k-1', CAM.chainMacro, () => ropeChain(PATH.s(), { karat: '21', radius: 0.24, twist: 0.75 })),

  // ---- Kids and everyday -----------------------------------------------------
  shot('kids-bangles-22k-1', [19, 44, 10, 0.3, 22], () => {
    const g = new THREE.Group();
    const a = bangle({ karat: '22', radius: 2.1, tube: 0.12 });
    a.rotation.x = -Math.PI / 2;
    a.position.set(-0.9, 0.09, 0.4);
    const b = bangle({ karat: '22', radius: 2.1, tube: 0.12 });
    b.rotation.x = -Math.PI / 2;
    b.position.set(1.0, 0.09, -0.6);
    g.add(a, b);
    return g;
  }),
  shot('ball-studs-18k-1', CAM.studs, () => {
    const g = new THREE.Group();
    const a = stud({ stone: 0.24, ball: true });
    a.position.set(-0.55, 0, 0.1);
    const b = stud({ stone: 0.24, ball: true });
    b.position.set(0.55, 0, -0.1);
    b.rotation.y = deg(30);
    g.add(a, b);
    return g;
  }),
  shot('ball-anklet-22k-1', CAM.bracelet, () => beadNecklace(loopPath(3.1, 2.5, 0.08, 5), { karat: '22', diameter: 0.28, gap: 0.04 })),
  shot('link-bracelet-18k-1', CAM.bracelet, () => chain(loopPath(3.0, 2.4, 0.07, 3), { karat: '18', length: 0.5, width: 0.34, wire: 0.07 })),
  shot('twisted-hoops-22k-1', CAM.hoops, () => {
    const g = new THREE.Group();
    const a = ropeChain(loopPath(1.15, 1.15, 0), { karat: '22', radius: 0.11, twist: 0.4 });
    a.position.set(-1.0, 0, 0.6);
    const b = ropeChain(loopPath(1.15, 1.15, 0), { karat: '22', radius: 0.11, twist: 0.4 });
    b.position.set(1.05, 0, -0.75);
    g.add(a, b);
    return g;
  }),
  shot('ruby-pendant-18k-1', CAM.pendant, () => {
    const g = new THREE.Group();
    g.add(stonePendant({ karat: '18', color: 0x8c1424 }));
    g.add(chain(PATH.pendantV(-0.78), { karat: '18', length: 0.26, width: 0.18, wire: 0.035 }));
    return g;
  }),
  shot('slim-kadas-21k-1', CAM.bangle, () => {
    const g = new THREE.Group();
    const a = kada({ karat: '21', tube: 0.24, ridges: 7, turns: 80 });
    a.rotation.x = -Math.PI / 2;
    a.position.y = 0.2;
    const b = kada({ karat: '21', tube: 0.24, ridges: 7, turns: 80 });
    b.rotation.x = -Math.PI / 2 + deg(12);
    b.position.set(2.0, 0.9, -1.5);
    g.add(a, b);
    return g;
  }),

  // ---- Opening image: wide, a quiet still life ---------------------------
  shot('hero', [15, 17, 8, 0.75, 18], () => {
    const g = new THREE.Group();
    g.add(ropeChain(floorPath([[-16, 7], [-8, 3.4], [-3, 0.2], [1.5, -1.6], [6, -1.4], [11, 0.6], [17, 3]]),
      { karat: '22', radius: 0.17 }));
    const r = solitaire({ karat: '18', stone: 0.3 });
    r.position.x = 1.7;
    r.position.z = 1.2;
    r.rotation.y = deg(-24);
    g.add(r);
    const b = bangle({ karat: '22' });
    b.rotation.x = -Math.PI / 2;
    b.position.set(-6.2, 0.15, -7.5);
    g.add(b);
    return g;
  }, { width: 1600, height: 1120, target: [0.9, 0.4], dof: { focusOn: [1.7, 1.0, 1.2], aperture: 0.0022, maxblur: 0.012 } }),
];
