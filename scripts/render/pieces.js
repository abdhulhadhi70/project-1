// Jewellery models for the demonstration renders. Units are centimetres and
// proportions follow real pieces: a 2.5 mm cable chain, a size-57 ring, a
// 6.4 cm bangle. Each builder returns a Group resting on y = 0.
import * as THREE from 'three';
import { ParametricGeometry } from 'three/addons/geometries/ParametricGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { diamond, gem, gold, pearl } from './studio.js';

// ---------------------------------------------------------------------------
// Paths a chain or necklace can lie along, on the floor (XZ plane).
// ---------------------------------------------------------------------------
export function floorPath(points, closed = false) {
  return new THREE.CatmullRomCurve3(
    points.map(([x, z]) => new THREE.Vector3(x, 0, z)),
    closed,
    'centripetal',
  );
}

// A frame that keeps "up" as the floor normal, which Frenet frames do not
// guarantee on a planar curve.
function floorFrame(curve, u) {
  const p = curve.getPointAt(u);
  const t = curve.getTangentAt(u).setY(0).normalize();
  const up = new THREE.Vector3(0, 1, 0);
  // up × t keeps (t, side, up) right-handed; the other order mirrors every link.
  const side = new THREE.Vector3().crossVectors(up, t).normalize();
  return { p, t, up, side };
}

// ---------------------------------------------------------------------------
// Chains
// ---------------------------------------------------------------------------
class Stadium extends THREE.Curve {
  constructor(length, width) {
    super();
    this.r = width / 2;
    this.s = Math.max(length - width, 0);
    this.total = 2 * this.s + 2 * Math.PI * this.r;
  }
  getPoint(t, target = new THREE.Vector3()) {
    const { r, s, total } = this;
    let d = t * total;
    if (d < s) return target.set(-s / 2 + d, r, 0);
    d -= s;
    const arc = Math.PI * r;
    if (d < arc) {
      const a = d / r;
      return target.set(s / 2 + Math.sin(a) * r, Math.cos(a) * r, 0);
    }
    d -= arc;
    if (d < s) return target.set(s / 2 - d, -r, 0);
    d -= s;
    const a = d / r;
    return target.set(-s / 2 - Math.sin(a) * r, -Math.cos(a) * r, 0);
  }
}

function linkGeometry(length, width, wire, { flatten = 1 } = {}) {
  const geo = new THREE.TubeGeometry(new Stadium(length, width), 72, wire, 14, true);
  geo.scale(1, 1, flatten);
  return geo;
}

/**
 * A chain of interlocking links laid along a floor path.
 *  style 'cable': links alternate flat and upright.
 *  style 'curb':  links all lie nearly flat, each twisted against the last.
 */
export function chain(curve, {
  karat = '22', length = 0.55, width = 0.36, wire = 0.07, style = 'cable', roughness = 0.13,
} = {}) {
  const group = new THREE.Group();
  const pitch = style === 'curb' ? (length - wire * 2) * 0.86 : length - wire * 2.1;
  const count = Math.floor(curve.getLength() / pitch);
  const geo = linkGeometry(length, width, wire, { flatten: style === 'curb' ? 0.62 : 1 });
  const mesh = new THREE.InstancedMesh(geo, gold(karat, { roughness }), count);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const basis = new THREE.Matrix4();
  for (let i = 0; i < count; i++) {
    const { p, t, up, side } = floorFrame(curve, (i + 0.5) / count);
    let roll;
    let lift;
    if (style === 'cable') {
      const upright = i % 2 === 0;
      roll = upright ? Math.PI / 2 : 0;
      lift = upright ? width / 2 + wire : wire;
    } else {
      roll = (i % 2 ? 1 : -1) * 0.42;
      lift = wire * 0.62 + Math.abs(Math.sin(roll)) * width * 0.5;
    }
    // Link plane: x along the path, y across it; then roll about the path.
    basis.makeBasis(t, side, up);
    q.setFromRotationMatrix(basis);
    q.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), roll));
    m.compose(p.clone().add(new THREE.Vector3(0, lift, 0)), q, new THREE.Vector3(1, 1, 1));
    mesh.setMatrixAt(i, m);
  }
  group.add(mesh);
  return group;
}

/** Rope chain: four polished strands twisted about the path. */
export function ropeChain(curve, { karat = '22', radius = 0.16, twist = 0.55, roughness = 0.12 } = {}) {
  const group = new THREE.Group();
  const strands = 4;
  const len = curve.getLength();
  const steps = Math.ceil(len / 0.02);
  const mat = gold(karat, { roughness });
  const geos = [];
  for (let k = 0; k < strands; k++) {
    const pts = [];
    for (let i = 0; i <= steps; i++) {
      const u = i / steps;
      const { p, up, side } = floorFrame(curve, u);
      const a = (u * len / twist) * Math.PI * 2 + (k * Math.PI * 2) / strands;
      const off = side.clone().multiplyScalar(Math.cos(a) * radius * 0.55)
        .add(up.clone().multiplyScalar(Math.sin(a) * radius * 0.55 + radius));
      pts.push(p.clone().add(off));
    }
    geos.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), steps, radius * 0.52, 10, false));
  }
  group.add(new THREE.Mesh(mergeGeometries(geos), mat));
  return group;
}

/** Beads strung along a path, touching. */
export function beadNecklace(curve, { karat = '22', diameter = 0.42, gap = 0.03, material } = {}) {
  const group = new THREE.Group();
  const count = Math.floor(curve.getLength() / (diameter + gap));
  const geo = new THREE.SphereGeometry(diameter / 2, 40, 28);
  const mesh = new THREE.InstancedMesh(geo, material ?? gold(karat, { roughness: 0.1 }), count);
  const m = new THREE.Matrix4();
  for (let i = 0; i < count; i++) {
    const p = curve.getPointAt((i + 0.5) / count);
    m.makeTranslation(p.x, diameter / 2, p.z);
    mesh.setMatrixAt(i, m);
  }
  group.add(mesh);
  return group;
}

// ---------------------------------------------------------------------------
// Gem cuts
// ---------------------------------------------------------------------------
/** Round brilliant: table, crown, girdle, pavilion. Table faces +y. */
export function brilliant(radius) {
  const r = radius;
  const pts = [
    [0.0001, 0], [0.56 * r, 0], [r, -0.16 * r], [r, -0.2 * r], [0.0001, -0.82 * r],
  ].map(([x, y]) => new THREE.Vector2(x, y)).reverse();
  const geo = new THREE.LatheGeometry(pts, 16);
  geo.translate(0, 0.82 * r, 0);
  return geo;
}

/** Oval cabochon-style faceted stone, flat back. */
export function ovalStone(rx, rz, h) {
  const pts = [];
  for (let i = 0; i <= 6; i++) {
    const a = (i / 6) * (Math.PI / 2);
    pts.push(new THREE.Vector2(Math.cos(a) * 1 + 0.0001, Math.sin(a) * 1));
  }
  const geo = new THREE.LatheGeometry(pts, 18);
  geo.scale(rx, h, rz);
  return geo;
}

// ---------------------------------------------------------------------------
// Rings
// ---------------------------------------------------------------------------
function bandProfile(inner, width, thickness, { flatTop = false } = {}) {
  const pts = [];
  const n = 28;
  for (let i = 0; i <= n; i++) {
    const a = Math.PI * (i / n) - Math.PI / 2;
    const bulge = flatTop ? Math.max(0.55, Math.cos(a)) : Math.cos(a);
    pts.push(new THREE.Vector2(inner + thickness * bulge, Math.sin(a) * width / 2));
  }
  // Comfort-fit inside: slightly convex.
  for (let i = n; i >= 0; i--) {
    const a = Math.PI * (i / n) - Math.PI / 2;
    pts.push(new THREE.Vector2(inner - thickness * 0.12 * Math.cos(a), Math.sin(a) * width / 2));
  }
  return pts;
}

/** A plain band, standing upright on its edge. */
export function band({ karat = '22', inner = 0.9, width = 0.42, thickness = 0.17, flatTop = false, roughness = 0.12 } = {}) {
  const geo = new THREE.LatheGeometry(bandProfile(inner, width, thickness, { flatTop }), 160);
  const mesh = new THREE.Mesh(geo, gold(karat, { roughness }));
  mesh.rotation.x = Math.PI / 2; // axis along z: ring stands up
  const group = new THREE.Group();
  group.add(mesh);
  group.position.y = inner + thickness;
  return group;
}

/** Solitaire: slim band, four-claw basket, round brilliant on top. */
export function solitaire({ karat = '18', inner = 0.88, stone = 0.32 } = {}) {
  const t = 0.13;
  const metal = gold(karat, { roughness: 0.1 });
  const out = new THREE.Group();
  const bandMesh = new THREE.Mesh(new THREE.LatheGeometry(bandProfile(inner, 0.22, t), 160), metal);
  bandMesh.rotation.x = Math.PI / 2; // ring axis along z, so it stands on its edge
  out.add(bandMesh);

  // Head, in band coordinates: the top of the band is at y = ringTop.
  const ringTop = inner + t;
  const seatY = ringTop + 0.2;
  const basket = new THREE.Mesh(new THREE.TorusGeometry(stone * 0.62, 0.028, 12, 48), metal);
  basket.rotation.x = Math.PI / 2;
  basket.position.y = seatY - 0.08;
  out.add(basket);
  for (let k = 0; k < 4; k++) {
    const a = Math.PI / 4 + (k * Math.PI) / 2;
    const dir = new THREE.Vector3(Math.cos(a), 0, Math.sin(a));
    const claw = new THREE.CatmullRomCurve3([
      dir.clone().multiplyScalar(stone * 0.25).setY(ringTop - 0.06),
      dir.clone().multiplyScalar(stone * 0.7).setY(seatY - 0.05),
      dir.clone().multiplyScalar(stone * 1.0).setY(seatY + stone * 0.25),
      dir.clone().multiplyScalar(stone * 0.86).setY(seatY + stone * 0.42),
    ]);
    out.add(new THREE.Mesh(new THREE.TubeGeometry(claw, 24, 0.032, 10), metal));
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.036, 16, 12), metal);
    tip.position.copy(claw.getPoint(1));
    out.add(tip);
  }
  // Girdle sits just inside the claw tips.
  const g = new THREE.Mesh(brilliant(stone), diamond());
  g.position.y = seatY - 0.44 * stone;
  out.add(g);

  out.position.y = inner + t;
  return out;
}

/** Signet: band with an oval polished face. */
export function signet({ karat = '21', inner = 0.92 } = {}) {
  const out = new THREE.Group();
  const metal = gold(karat, { roughness: 0.16 });
  const bandMesh = new THREE.Mesh(new THREE.LatheGeometry(bandProfile(inner, 0.34, 0.16), 160), metal);
  bandMesh.rotation.x = Math.PI / 2;
  out.add(bandMesh);
  // Face: an oval cushion, shoulders blending into the band.
  const pts = [];
  for (let i = 0; i <= 24; i++) {
    const a = (i / 24) * (Math.PI / 2);
    pts.push(new THREE.Vector2(0.0001 + Math.cos(a) * 1, Math.pow(Math.sin(a), 0.35) * 1));
  }
  const face = new THREE.Mesh(new THREE.LatheGeometry(pts.reverse(), 96), metal);
  face.geometry.scale(0.62, 0.34, 0.5);
  face.position.y = inner - 0.12;
  out.add(face);
  const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.62, 0.02, 96), gold(karat, { roughness: 0.06 }));
  plate.scale.set(1, 1, 0.8);
  plate.position.y = inner + 0.22;
  out.add(plate);
  out.position.y = inner + 0.16;
  return out;
}

/** Eternity-style band: a row of small brilliants set into the top half. */
export function stoneBand({ karat = '18', inner = 0.88, stones = 9, stone = 0.09 } = {}) {
  const out = band({ karat, inner, width: 0.28, thickness: 0.14 });
  const r = inner + 0.14;
  const g = brilliant(stone);
  const mat = diamond();
  for (let i = 0; i < stones; i++) {
    const a = Math.PI / 2 + ((i - (stones - 1) / 2) * 0.115);
    const s = new THREE.Mesh(g, mat);
    s.position.set(Math.cos(a), Math.sin(a), 0).multiplyScalar(r - stone * 0.85);
    s.lookAt(s.position.clone().multiplyScalar(2));
    s.rotateX(Math.PI / 2);
    out.add(s);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Earrings
// ---------------------------------------------------------------------------
export function hoop({ karat = '22', radius = 1.1, tube = 0.11 } = {}) {
  const geo = new THREE.TorusGeometry(radius, tube, 32, 160);
  geo.scale(1, 1, 1.5);
  const mesh = new THREE.Mesh(geo, gold(karat, { roughness: 0.1 }));
  // Post and catch at the top.
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.3, 12), gold(karat));
  post.rotation.x = Math.PI / 2;
  post.position.set(0, radius, 0.18);
  const g = new THREE.Group();
  g.add(mesh, post);
  return g;
}

/** Drop: hook, small bezel stone, then a polished teardrop. */
export function drop({ karat = '22', withPearl = false } = {}) {
  const g = new THREE.Group();
  const metal = gold(karat, { roughness: 0.1 });
  const hook = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.0, 0), new THREE.Vector3(0, 0.35, 0), new THREE.Vector3(0.05, 0.62, 0),
    new THREE.Vector3(0.28, 0.78, 0), new THREE.Vector3(0.5, 0.6, 0), new THREE.Vector3(0.52, 0.3, 0),
  ]);
  g.add(new THREE.Mesh(new THREE.TubeGeometry(hook, 64, 0.022, 10), metal));
  const bezel = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.03, 16, 40), metal);
  bezel.position.y = -0.1;
  g.add(bezel);
  const st = new THREE.Mesh(brilliant(0.1), diamond());
  st.rotation.x = Math.PI / 2;
  st.position.set(0, -0.1, -0.06);
  g.add(st);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.016, 10, 24), metal);
  ring.position.y = -0.24;
  ring.rotation.y = Math.PI / 2;
  g.add(ring);
  if (withPearl) {
    const p = new THREE.Mesh(new THREE.SphereGeometry(0.26, 48, 32), pearl());
    p.position.y = -0.52;
    g.add(p);
  } else {
    const pts = [];
    for (let i = 0; i <= 40; i++) {
      const t = i / 40;
      const a = t * Math.PI;
      pts.push(new THREE.Vector2(0.0001 + Math.sin(a) * 0.28 * Math.pow(t, 0.6), -Math.cos(a) * 0.48 - 0.48));
    }
    const tear = new THREE.Mesh(new THREE.LatheGeometry(pts, 96), gold(karat, { roughness: 0.08 }));
    tear.position.y = -0.28;
    tear.scale.z = 0.55;
    g.add(tear);
  }
  return g;
}

// ---------------------------------------------------------------------------
// Pendants
// ---------------------------------------------------------------------------
function star(points, outer, inner) {
  const s = new THREE.Shape();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 ? inner : outer;
    const a = (i / (points * 2)) * Math.PI * 2 + Math.PI / 2;
    const fn = i ? 'lineTo' : 'moveTo';
    s[fn](Math.cos(a) * r, Math.sin(a) * r);
  }
  return s;
}

/** Coin pendant with a raised rim and an eight-point star, lying flat. */
export function coinPendant({ karat = '22', radius = 1.0 } = {}) {
  const g = new THREE.Group();
  const metal = gold(karat, { roughness: 0.14 });
  const pts = [
    [0.0001, 0.07], [radius * 0.86, 0.07], [radius * 0.9, 0.13], [radius * 0.97, 0.13], [radius, 0.08],
    [radius, 0.02], [radius * 0.97, 0], [0.0001, 0],
  ].map(([x, y]) => new THREE.Vector2(x, y)).reverse();
  g.add(new THREE.Mesh(new THREE.LatheGeometry(pts, 160), metal));
  const emb = new THREE.ExtrudeGeometry(star(8, radius * 0.62, radius * 0.4), {
    depth: 0.025, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 3,
  });
  emb.rotateX(-Math.PI / 2);
  const e = new THREE.Mesh(emb, gold(karat, { roughness: 0.08 }));
  e.position.y = 0.07;
  g.add(e);
  const inner = new THREE.Mesh(new THREE.TorusGeometry(radius * 0.25, 0.022, 12, 64), metal);
  inner.rotation.x = Math.PI / 2;
  inner.position.y = 0.13;
  g.add(inner);
  const bail = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.045, 16, 48), metal);
  bail.position.set(0, 0.06, -radius - 0.13);
  bail.rotation.x = Math.PI / 2;
  bail.scale.set(0.7, 1, 1);
  g.add(bail);
  return g;
}

/** Oval green stone in a polished bezel, lying flat. */
export function stonePendant({ karat = '18', color = 0x0f6b45 } = {}) {
  const g = new THREE.Group();
  const metal = gold(karat, { roughness: 0.1 });
  const rx = 0.42, rz = 0.58;
  const bezel = new THREE.Mesh(new THREE.TorusGeometry(1, 0.06, 18, 96), metal);
  bezel.scale.set(rx + 0.03, rz + 0.03, 1.4);
  bezel.rotation.x = Math.PI / 2;
  bezel.position.y = 0.09;
  g.add(bezel);
  const back = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.08, 64), metal);
  back.scale.set(rx + 0.06, 1, rz + 0.06);
  back.position.y = 0.04;
  g.add(back);
  const s = new THREE.Mesh(ovalStone(rx, rz, 0.22), gem(color, { attenuation: 0x0a4a2e, distance: 0.25 }));
  s.position.y = 0.08;
  g.add(s);
  const bail = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.04, 16, 48), metal);
  bail.position.set(0, 0.08, -rz - 0.2);
  bail.rotation.x = Math.PI / 2;
  bail.scale.set(0.7, 1, 1);
  g.add(bail);
  return g;
}

// ---------------------------------------------------------------------------
// Bangles
// ---------------------------------------------------------------------------
export function bangle({ karat = '22', radius = 3.2, tube = 0.2, flatten = 0.75, roughness = 0.12 } = {}) {
  const geo = new THREE.TorusGeometry(radius, tube, 40, 240);
  geo.scale(1, 1, flatten);
  const m = new THREE.Mesh(geo, gold(karat, { roughness }));
  const g = new THREE.Group();
  g.add(m);
  return g;
}

/** Kada: a heavier bangle with twisted ridges. */
export function kada({ karat = '22', radius = 3.25, tube = 0.36, ridges = 9, turns = 60 } = {}) {
  const geo = new ParametricGeometry((u, v, target) => {
    const th = u * Math.PI * 2;
    const ph = v * Math.PI * 2;
    const groove = 0.06 * Math.pow(Math.abs(Math.sin((ridges * ph + turns * th) / 2)), 0.6);
    const r = tube * (1 - groove);
    const x = (radius + r * Math.cos(ph)) * Math.cos(th);
    const y = (radius + r * Math.cos(ph)) * Math.sin(th);
    const z = r * Math.sin(ph) * 0.8;
    target.set(x, y, z);
  }, 720, 72);
  geo.computeVertexNormals();
  const g = new THREE.Group();
  g.add(new THREE.Mesh(geo, gold(karat, { roughness: 0.11 })));
  return g;
}
