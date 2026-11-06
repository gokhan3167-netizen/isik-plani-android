/* LampOff — GDTF → hafif 3D gövde + plan sembolü dönüştürücü.
 * Hem derlemede (Node, scripts/fx3d-build.mjs) hem uygulamada (kullanıcının içe aktardığı GDTF) çalışır; dış bağımlılık yok.
 * Girdi: get(name) → Uint8Array|null  (GDTF zip içindeki dosyalar)
 * Çıktı: { b, m, k:[anahtar…], pan, tilt, g:[[ebeveyn, tür, m12, mesh, r]], ms:[{v,i,s,o}], sym:{svg,w,l}, tri }
 *   tür: 'G' gövde, 'A' eksen, 'B' hüzme (r = hüzme yarıçapı)
 *   m12: GDTF yerel matrisi (satır öncelikli 3×4, metre)   v: Int16 nokta (base64), i: Uint16 üçgen (base64)
 * Koordinatlar GDTF'tir: Z yukarı, cihaz ASILI durur, hüzme dinlenmede −Z.
 */
(function (G) {
  'use strict';
  const td = typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-8') : null;
  const u8s = b => td ? td.decode(b) : Buffer.from(b).toString('utf8');
  // ---------- XML (küçük) ----------
  const dec = s => s.replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
  function parseXML(s) {
    const root = { tag: '#', a: {}, c: [] }, st = [root];
    const re = /<!--[\s\S]*?-->|<\?[\s\S]*?\?>|<!\[CDATA\[[\s\S]*?\]\]>|<(\/?)([\w:.-]+)((?:\s+[\w:.-]+\s*=\s*(?:"[^"]*"|'[^']*'))*)\s*(\/?)>/g; let m;
    while ((m = re.exec(s))) {
      if (!m[2]) continue; const [, cl, tag, at, self] = m;
      if (cl) { while (st.length > 1 && st.pop().tag !== tag); continue; }
      const a = {}; at.replace(/([\w:.-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g, (_, k, v1, v2) => { a[k] = dec(v1 != null ? v1 : v2); return ''; });
      const n = { tag, a, c: [] }; st[st.length - 1].c.push(n); if (!self) st.push(n);
    }
    return root;
  }
  const all = (n, t, o = []) => { for (const c of n.c) { if (c.tag === t) o.push(c); all(c, t, o); } return o; };
  const child = (n, t) => n && n.c.find(c => c.tag === t);
  // ---------- matris (4×4 satır öncelikli, dizi[16]) ----------
  const I4 = () => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  function mul(a, b) { const r = new Array(16); for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { let s = 0; for (let k = 0; k < 4; k++) s += a[i * 4 + k] * b[k * 4 + j]; r[i * 4 + j] = s; } return r; }
  const ap = (m, x, y, z) => [m[0] * x + m[1] * y + m[2] * z + m[3], m[4] * x + m[5] * y + m[6] * z + m[7], m[8] * x + m[9] * y + m[10] * z + m[11]];
  function parsePos(s) { const v = String(s || '').match(/-?[\d.]+(?:e[-+]?\d+)?/gi); if (!v || v.length < 12) return I4(); const n = v.map(Number); return [n[0], n[1], n[2], n[3], n[4], n[5], n[6], n[7], n[8], n[9], n[10], n[11], 0, 0, 0, 1]; }
  const rotZ = a => { const c = Math.cos(a), s = Math.sin(a); return [c, -s, 0, 0, s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]; };
  const rotX = a => { const c = Math.cos(a), s = Math.sin(a); return [1, 0, 0, 0, 0, c, -s, 0, 0, s, c, 0, 0, 0, 0, 1]; };
  // ---------- 3DS ----------
  function parse3ds(D) {
    const dv = new DataView(D.buffer, D.byteOffset, D.byteLength), V = [], T = [];
    if (D.length < 6 || dv.getUint16(0, true) !== 0x4D4D) return null;
    let base = 0;
    (function walk(b, e) {
      let p = b;
      while (p + 6 <= e) {
        const id = dv.getUint16(p, true), len = dv.getUint32(p + 2, true); if (len < 6 || p + len > e) return; const body = p + 6;
        if (id === 0x4D4D || id === 0x3D3D) walk(body, p + len);
        else if (id === 0x4000) { let q = body; while (q < p + len && D[q] !== 0) q++; walk(q + 1, p + len); }
        else if (id === 0x4100) { base = V.length / 3; walk(body, p + len); }
        else if (id === 0x4110) { base = V.length / 3; const n = dv.getUint16(body, true); for (let i = 0; i < n && body + 2 + (i + 1) * 12 <= p + len; i++) V.push(dv.getFloat32(body + 2 + i * 12, true), dv.getFloat32(body + 6 + i * 12, true), dv.getFloat32(body + 10 + i * 12, true)); }
        else if (id === 0x4120) { const n = dv.getUint16(body, true); for (let i = 0; i < n && body + 2 + (i + 1) * 8 <= p + len; i++) { const f = body + 2 + i * 8; T.push(base + dv.getUint16(f, true), base + dv.getUint16(f + 2, true), base + dv.getUint16(f + 4, true)); } }
        p += len;
      }
    })(0, D.length);
    return V.length && T.length ? { V, T } : null;
  }
  // ---------- GLB ----------
  function parseGlb(D) {
    const dv = new DataView(D.buffer, D.byteOffset, D.byteLength);
    if (D.length < 20 || dv.getUint32(0, true) !== 0x46546C67) return null;
    let p = 12, J = null, bin = null;
    while (p + 8 <= D.length) { const len = dv.getUint32(p, true), ty = dv.getUint32(p + 4, true); if (p + 8 + len > D.length) break; if (ty === 0x4E4F534A) J = JSON.parse(u8s(D.subarray(p + 8, p + 8 + len))); else if (ty === 0x004E4942) bin = p + 8; p += 8 + len; }
    if (!J || bin == null || !J.meshes) return null;
    const V = [], T = [], acc = J.accessors || [], views = J.bufferViews || [];
    const view = i => { const a = acc[i]; if (!a || a.bufferView == null) return null; const v = views[a.bufferView]; return { a, off: bin + (v.byteOffset || 0) + (a.byteOffset || 0), st: v.byteStride || 0 }; };
    function addMesh(mi, W) {
      for (const pr of (J.meshes[mi] && J.meshes[mi].primitives) || []) {
        if (pr.mode != null && pr.mode !== 4) continue; const pa = pr.attributes && pr.attributes.POSITION; if (pa == null) continue;
        const P = view(pa); if (!P || P.a.componentType !== 5126) continue; const st = P.st || 12, n = P.a.count, b0 = V.length / 3;
        for (let i = 0; i < n; i++) { const o = P.off + i * st; const q = ap(W, dv.getFloat32(o, true), dv.getFloat32(o + 4, true), dv.getFloat32(o + 8, true)); V.push(q[0], q[1], q[2]); }
        if (pr.indices != null) { const X = view(pr.indices); if (!X) continue; const ct = X.a.componentType, bs = ct === 5125 ? 4 : ct === 5123 ? 2 : 1, st2 = X.st || bs;
          for (let i = 0; i + 2 < X.a.count; i += 3) for (let k = 0; k < 3; k++) { const o = X.off + (i + k) * st2; T.push(b0 + (bs === 4 ? dv.getUint32(o, true) : bs === 2 ? dv.getUint16(o, true) : D[o])); } }
        else for (let i = 0; i + 2 < n; i += 3) T.push(b0 + i, b0 + i + 1, b0 + i + 2);
      }
    }
    function local(nd) {
      if (nd.matrix && nd.matrix.length === 16) { const c = nd.matrix; return [c[0], c[4], c[8], c[12], c[1], c[5], c[9], c[13], c[2], c[6], c[10], c[14], 0, 0, 0, 1]; }
      const t = nd.translation || [0, 0, 0], q = nd.rotation || [0, 0, 0, 1], s = nd.scale || [1, 1, 1], [x, y, z, w] = q;
      const r = [1 - 2 * (y * y + z * z), 2 * (x * y - z * w), 2 * (x * z + y * w), 2 * (x * y + z * w), 1 - 2 * (x * x + z * z), 2 * (y * z - x * w), 2 * (x * z - y * w), 2 * (y * z + x * w), 1 - 2 * (x * x + y * y)];
      return [r[0] * s[0], r[1] * s[1], r[2] * s[2], t[0], r[3] * s[0], r[4] * s[1], r[5] * s[2], t[1], r[6] * s[0], r[7] * s[1], r[8] * s[2], t[2], 0, 0, 0, 1];
    }
    const nodes = J.nodes || [];
    function visit(i, P, d) { const nd = nodes[i]; if (!nd || d > 32) return; const W = mul(P, local(nd)); if (nd.mesh != null) addMesh(nd.mesh, W); for (const c of nd.children || []) visit(c, W, d + 1); }
    const sc = J.scenes && J.scenes[J.scene || 0];
    if (sc && sc.nodes) sc.nodes.forEach(i => visit(i, I4(), 0)); else J.meshes.forEach((_, i) => addMesh(i, I4()));
    return V.length && T.length ? { V, T } : null;
  }
  // ---------- modeli GDTF eksenine oturt, L/W/H'ye ölçekle (Studio ile aynı kural) ----------
  function fit(M, L, W, H, preferYUp) {
    const V = M.V, n = V.length / 3;
    const box = yu => { const lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9]; for (let i = 0; i < n; i++) { const x = V[i * 3], y = yu ? -V[i * 3 + 2] : V[i * 3 + 1], z = yu ? V[i * 3 + 1] : V[i * 3 + 2]; if (x < lo[0]) lo[0] = x; if (y < lo[1]) lo[1] = y; if (z < lo[2]) lo[2] = z; if (x > hi[0]) hi[0] = x; if (y > hi[1]) hi[1] = y; if (z > hi[2]) hi[2] = z; } return [hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]]; };
    let yu = preferYUp;
    if (L > 0 && W > 0 && H > 0) { const err = e => { const r = [Math.max(e[0], 1e-6) / L, Math.max(e[1], 1e-6) / W, Math.max(e[2], 1e-6) / H], mn = (r[0] + r[1] + r[2]) / 3; return r.reduce((s, x) => s + Math.abs(Math.log(x / mn)), 0); }; const ez = err(box(false)), ey = err(box(true)); if (Math.abs(ez - ey) > 0.05) yu = ey < ez; }
    const e = box(yu), unit = (L > 0 || W > 0 || H > 0) ? 1 : (Math.max(e[0], e[1], e[2]) > 3 ? 0.001 : 1);
    const s = [L > 0 && e[0] > 1e-9 ? L / e[0] : unit, W > 0 && e[1] > 1e-9 ? W / e[1] : unit, H > 0 && e[2] > 1e-9 ? H / e[2] : unit];
    const out = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { const x = V[i * 3], y = yu ? -V[i * 3 + 2] : V[i * 3 + 1], z = yu ? V[i * 3 + 1] : V[i * 3 + 2]; out[i * 3] = x * s[0]; out[i * 3 + 1] = y * s[1]; out[i * 3 + 2] = z * s[2]; }
    return { V: out, T: M.T };
  }
  function prim(type, L, W, H) {
    L = Math.max(L, 0.02); W = Math.max(W, 0.02); H = Math.max(H, 0.02);
    const V = [], T = [], cyl = /Cylinder|Conventional|Head/i.test(type);
    if (cyl) { const S = 16; for (let i = 0; i < S; i++) { const a = 2 * Math.PI * i / S, x = Math.cos(a) * L / 2, y = Math.sin(a) * W / 2; V.push(x, y, -H / 2, x, y, H / 2); }
      V.push(0, 0, -H / 2, 0, 0, H / 2); const b = 2 * S, t = 2 * S + 1;
      for (let i = 0; i < S; i++) { const j = (i + 1) % S; T.push(2 * i, 2 * j, 2 * i + 1, 2 * i + 1, 2 * j, 2 * j + 1, b, 2 * j, 2 * i, t, 2 * i + 1, 2 * j + 1); } }
    else { for (let i = 0; i < 8; i++) V.push((i & 1 ? .5 : -.5) * L, (i & 2 ? .5 : -.5) * W, (i & 4 ? .5 : -.5) * H);
      [0, 2, 1, 1, 2, 3, 4, 5, 6, 5, 7, 6, 0, 1, 4, 1, 5, 4, 2, 6, 3, 3, 6, 7, 0, 4, 2, 2, 4, 6, 1, 3, 5, 3, 7, 5].forEach(x => T.push(x)); }
    return { V: Float32Array.from(V), T };
  }
  // ---------- sadeleştirme: nokta kümeleme (aynı hücredeki noktalar birleşir) ----------
  function cluster(M, cell) {
    const V = M.V, T = M.T, n = V.length / 3, key = new Map(), remap = new Int32Array(n), acc = [];
    for (let i = 0; i < n; i++) { const k = Math.round(V[i * 3] / cell) + ',' + Math.round(V[i * 3 + 1] / cell) + ',' + Math.round(V[i * 3 + 2] / cell); let j = key.get(k);
      if (j == null) { j = acc.length / 4; key.set(k, j); acc.push(0, 0, 0, 0); } acc[j * 4] += V[i * 3]; acc[j * 4 + 1] += V[i * 3 + 1]; acc[j * 4 + 2] += V[i * 3 + 2]; acc[j * 4 + 3]++; remap[i] = j; }
    const m = acc.length / 4, NV = new Float32Array(m * 3); for (let j = 0; j < m; j++) { const c = acc[j * 4 + 3]; NV[j * 3] = acc[j * 4] / c; NV[j * 3 + 1] = acc[j * 4 + 1] / c; NV[j * 3 + 2] = acc[j * 4 + 2] / c; }
    const NT = [], seen = new Set();
    for (let i = 0; i + 2 < T.length; i += 3) { const a = remap[T[i]], b = remap[T[i + 1]], c = remap[T[i + 2]]; if (a === b || b === c || a === c) continue;
      const s = [a, b, c].sort((x, y) => x - y).join(','); if (seen.has(s)) continue; seen.add(s); NT.push(a, b, c); }
    return { V: NV, T: NT };
  }
  function weld(M) { return cluster(M, 1e-5); }
  // ---------- base64 ----------
  function b64(u8) { if (typeof Buffer !== 'undefined') return Buffer.from(u8.buffer, u8.byteOffset, u8.byteLength).toString('base64'); let s = ''; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s); }
  function unb64(s) { if (typeof Buffer !== 'undefined' && typeof atob === 'undefined') return new Uint8Array(Buffer.from(s, 'base64')); const b = atob(s), u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; }
  function pack(M) {
    const V = M.V, n = V.length / 3, lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9];
    for (let i = 0; i < n; i++) for (let k = 0; k < 3; k++) { const x = V[i * 3 + k]; if (x < lo[k]) lo[k] = x; if (x > hi[k]) hi[k] = x; }
    const o = lo.map((l, k) => (l + hi[k]) / 2), s = lo.map((l, k) => Math.max(1e-6, (hi[k] - l) / 2) / 32767), q = new Int16Array(n * 3);
    for (let i = 0; i < n; i++) for (let k = 0; k < 3; k++) q[i * 3 + k] = Math.round((V[i * 3 + k] - o[k]) / s[k]);
    const idx = n > 65535 ? new Uint32Array(M.T) : new Uint16Array(M.T);
    return { v: b64(new Uint8Array(q.buffer)), i: b64(new Uint8Array(idx.buffer)), w: n > 65535 ? 4 : 2, s: s.map(x => +x.toPrecision(6)), o: o.map(x => +x.toFixed(5)) };
  }
  function unpack(p) {
    const q = new Int16Array(unb64(p.v).buffer), n = q.length / 3, V = new Float32Array(q.length);
    for (let i = 0; i < n; i++) for (let k = 0; k < 3; k++) V[i * 3 + k] = q[i * 3 + k] * p.s[k] + p.o[k];
    const ib = unb64(p.i).buffer, T = p.w === 4 ? new Uint32Array(ib) : new Uint16Array(ib);
    return { V, T };
  }
  // ---------- anahtar (uygulamadaki Je ile aynı) ----------
  const key = (b, m) => (String(b || '') + ' ' + String(m || '')).toLocaleLowerCase('tr').replace(/[^a-z0-9ğüşıöç]/g, '');
  const shortBrand = b => String(b || '').replace(/\b(lighting|lightings|professional|light|lights|systems?|gmbh|s\.?p\.?a\.?|inc\.?|ltd\.?|led technik|led-technik)\b/gi, '').replace(/\s+/g, ' ').trim();
  function keysFor(b, m, long) {
    const out = new Set(), sb = shortBrand(b);
    const vars = []; for (const mm of [m, long]) { if (!mm) continue; let x = String(mm).replace(/[™®]/g, '').replace(/\([^)]*\)/g, ' ').replace(/\s+/g, ' ').trim(); vars.push(mm, x);
      for (let i = 0; i < 2; i++) { const y = x.replace(/\s+(fs|ip|cld|ltx|rgbw|rgba|fw|ev|sw|hd|tm)$/i, ''); if (y === x) break; x = y; vars.push(x); } }
    for (const mm of vars) { out.add(key(b, mm)); out.add(key(sb, mm)); out.add(key('', mm)); out.add(key(sb.split(' ')[0], mm)); }
    return [...out].filter(k => k.length > 3);
  }
  // ---------- ana dönüştürme ----------
  function convert(get, opt) {
    opt = opt || {};
    const xb = get('description.xml'); if (!xb) return null;
    const doc = parseXML(u8s(xb)), ft = all(doc, 'FixtureType')[0]; if (!ft) return null;
    const brand = ft.a.Manufacturer || '', model = ft.a.LongName || ft.a.Name || '', name = ft.a.Name || model;
    const models = {}; for (const md of all(ft, 'Model')) models[md.a.Name] = md;
    const geomsRoot = child(ft, 'Geometries'); if (!geomsRoot) return null;
    const isGeom = t => /^(Geometry|Axis|Beam|Filter\w*|Inventory|Structure|Support|Magnet|Display|Laser|MediaServer\w*|GeometryReference)$/.test(t);
    const top = {}; geomsRoot.c.forEach(g => { if (isGeom(g.tag)) top[g.a.Name] = g; });
    const refd = new Set(); all(geomsRoot, 'GeometryReference').forEach(r => r.a.Geometry && refd.add(r.a.Geometry));
    // pan/tilt: DMX'teki Pan/Tilt kanalının geometrisi; yoksa ilk iki Axis; yoksa ad (Yoke/Head)
    let panName = '', tiltName = '';
    const mode0 = all(ft, 'DMXMode')[0];
    if (mode0) for (const ch of all(mode0, 'DMXChannel')) { const lc = all(ch, 'LogicalChannel')[0], at = lc && lc.a.Attribute; if (at === 'Pan' && !panName) panName = ch.a.Geometry || ''; if (at === 'Tilt' && !tiltName) tiltName = ch.a.Geometry || ''; }
    const meshCache = new Map(), ms = [], g = []; let fromFile = 0;
    let totalTri = 0;
    function meshFor(mn) {
      if (!mn) return -1; if (meshCache.has(mn)) return meshCache.get(mn);
      const md = models[mn]; let res = -1;
      if (md) {
        const L = +md.a.Length || 0, W = +md.a.Width || 0, H = +md.a.Height || 0, f = md.a.File, pt = md.a.PrimitiveType || '';
        let M = null;
        if (f) { for (const d of ['models/gltf/', 'models/gltf_low/', 'models/gltf_high/']) { if (M) break; const b = get(d + f + '.glb'); if (b) { try { const r = parseGlb(b); if (r) { M = fit(r, L, W, H, true); fromFile++; } } catch (_) { } } }
          for (const d of ['models/3ds/', 'models/3ds_low/', 'models/3ds_high/']) { if (M) break; const b = get(d + f + '.3ds'); if (b) { try { const r = parse3ds(b); if (r) { M = fit(r, L, W, H, false); fromFile++; } } catch (_) { } } } }
        if (!M && pt && !/^(Undefined|Pigtail)$/i.test(pt) && !/^Beam/i.test(mn) && (L > 0.01 || W > 0.01)) M = prim(pt, L, W, H);
        if (M) { M = weld(M); res = ms.length; ms.push(M); }
      }
      meshCache.set(mn, res); return res;
    }
    function build(node, parent, depth) {
      if (!node || depth > 24 || !isGeom(node.tag)) return;
      let m = parsePos(node.a.Position);
      if (node.tag === 'GeometryReference') { const t = top[node.a.Geometry]; if (!t) return; const idx = g.length; g.push([parent, 'G', m, -1, 0, node.a.Name || '']);
        const sub = Object.assign({}, t, { a: Object.assign({}, t.a, { Position: '{1,0,0,0}{0,1,0,0}{0,0,1,0}{0,0,0,1}' }) }); build(sub, idx, depth + 1); return; }
      const ty = node.tag === 'Axis' ? 'A' : node.tag === 'Beam' ? 'B' : 'G';
      const idx = g.length; g.push([parent, ty, m, node.tag === 'Beam' ? -1 : meshFor(node.a.Model), ty === 'B' ? (+node.a.BeamRadius || 0.05) : 0, node.a.Name || '']);
      for (const c of node.c) build(c, idx, depth + 1);
    }
    for (const t of geomsRoot.c) if (isGeom(t.tag) && !refd.has(t.a.Name)) build(t, -1, 0);
    if (!ms.length || !g.length || !fromFile) return null; // yalnız kutu/silindir: uygulamanın kendi simgesi daha iyi
    // Aksesuar (kapak/barndoor, flag…) GDTF'te çoğu kez yanlış yerde durur (ör. ELP Manet: lensten 30 cm uzakta, havada) → çizme
    { const W0 = []; g.forEach((x, i) => { W0[i] = x[0] >= 0 ? mul(W0[x[0]], x[2]) : x[2]; });
      const bi = g.findIndex(x => x[1] === 'B'), bo = bi >= 0 ? ap(W0[bi], 0, 0, 0) : null;
      g.forEach((x, i) => { if (x[3] < 0 || !/barn ?door|flag|visor|top ?hat|snoot|shutter ?door/i.test(x[5])) return;
        if (!bo) { x[3] = -1; return; } const M = ms[x[3]]; let cx = 0, cy = 0, cz = 0; const n = M.V.length / 3; for (let k = 0; k < n; k++) { cx += M.V[k * 3]; cy += M.V[k * 3 + 1]; cz += M.V[k * 3 + 2]; }
        const c = ap(W0[i], cx / n, cy / n, cz / n); if (Math.hypot(c[0] - bo[0], c[1] - bo[1], c[2] - bo[2]) > 0.22) x[3] = -1; }); }
    let pan = g.findIndex(x => panName && x[5] === panName), tilt = g.findIndex(x => tiltName && x[5] === tiltName);
    const axes = g.map((x, i) => x[1] === 'A' ? i : -1).filter(i => i >= 0);
    if (pan < 0 && tilt < 0 && axes.length >= 2 && !panName) { pan = axes[0]; tilt = axes[1]; }
    // ---- sadeleştir: bütün cihaz için üçgen bütçesi ----
    const BUDGET = opt.budget || 3500;
    const ext = (() => { let lo = 1e9, hi = -1e9; ms.forEach(M => { for (let i = 0; i < M.V.length; i++) { if (M.V[i] < lo) lo = M.V[i]; if (M.V[i] > hi) hi = M.V[i]; } }); return Math.max(0.05, hi - lo); })();
    let tri = ms.reduce((s, M) => s + M.T.length / 3, 0), cell = ext / 160, out = ms;
    for (let it = 0; it < 8 && tri > BUDGET; it++) { out = ms.map(M => cluster(M, cell)); tri = out.reduce((s, M) => s + M.T.length / 3, 0); cell *= 1.45; }
    totalTri = tri;
    const res = {
      b: brand, m: model, n: name, k: keysFor(brand, name, model), pan, tilt,
      g: g.map(x => [x[0], x[1], x[2].slice(0, 12).map(v => +v.toFixed(5)), x[3], +(+x[4]).toFixed(4)]),
      ms: out.map(pack), tri: totalTri
    };
    try { res.sym = symbol(res, out); } catch (e) { res.sym = null; }
    return res;
  }
  // ---------- dünyaya yerleştir (pan/tilt açılarıyla) ----------
  function worldMats(fx, pan, tilt) {
    const W = new Array(fx.g.length);
    for (let i = 0; i < fx.g.length; i++) { const x = fx.g[i]; let L = x[2].concat([0, 0, 0, 1]);
      if (i === fx.pan && pan) L = mul(L, rotZ(pan)); if (i === fx.tilt && tilt) L = mul(L, rotX(tilt));
      W[i] = x[0] >= 0 ? mul(W[x[0]], L) : L; }
    return W;
  }
  // ---------- plan sembolü: üstten bakış, parça parça siluet ----------
  function symbol(fx, meshes) {
    const mover = fx.pan >= 0 || fx.tilt >= 0;
    // Hareketli: asılı, hüzme aşağıda, alttan bakış (kafa önde). Sabit: hüzme yatay +Y yönüne (seyirciye), üstten bakış.
    let W = worldMats(fx, 0, 0), pre = I4();
    if (!mover) {
      const bi = fx.g.findIndex(x => x[1] === 'B');
      if (bi >= 0) { const d = ap(W[bi], 0, 0, -1), o = ap(W[bi], 0, 0, 0); const dir = [d[0] - o[0], d[1] - o[1], d[2] - o[2]]; // hüzmeyi -Y (planda aşağı = seyirci) yap
        const yaw = Math.atan2(dir[0], -dir[1]); const h = Math.hypot(dir[0], dir[1]); const pitch = Math.atan2(-dir[2], h);
        pre = mul(rotX(pitch), rotZ(yaw)); }
    }
    // parçalar: mesh'i olan her geometri
    const parts = [];
    fx.g.forEach((x, i) => { if (x[3] < 0) return; const M = meshes[x[3]], m = mul(pre, W[i]), P = [];
      let zs = 0; for (let t = 0; t + 2 < M.T.length; t += 3) { const tri = [M.T[t], M.T[t + 1], M.T[t + 2]].map(j => ap(m, M.V[j * 3], M.V[j * 3 + 1], M.V[j * 3 + 2])); P.push(tri); zs += tri[0][2] + tri[1][2] + tri[2][2]; }
      if (P.length) parts.push({ P, z: zs / (P.length * 3), head: i === fx.tilt || (fx.tilt >= 0 && isDesc(fx, i, fx.tilt)) }); });
    if (!parts.length) return null;
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    parts.forEach(p => p.P.forEach(t => t.forEach(q => { x0 = Math.min(x0, q[0]); x1 = Math.max(x1, q[0]); y0 = Math.min(y0, -q[1]); y1 = Math.max(y1, -q[1]); })));
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, w = x1 - x0, l = y1 - y0, R = 200, px = Math.max(w, l) / R;
    const gw = Math.ceil(w / px) + 3, gh = Math.ceil(l / px) + 3;
    // Hareketli: alttan bakış → en alttaki (z küçük) en önde; sabit: üstten → z büyük önde
    parts.sort((a, b) => mover ? b.z - a.z : a.z - b.z);
    let svg = '';
    const beams = fx.g.map((x, i) => x[1] === 'B' ? i : -1).filter(i => i >= 0);
    for (const p of parts) {
      const grid = new Uint8Array(gw * gh);
      for (const t of p.P) rasterTri(grid, gw, gh, t.map(q => [(q[0] - x0) / px + 1.5, (-q[1] - y0) / px + 1.5]));
      const path = contours(grid, gw, gh).map(poly => simplify(poly, 0.9)).filter(poly => poly.length >= 3)
        .map(poly => 'M' + poly.map(q => ((q[0] - 1.5) * px + x0 - cx).toFixed(3) + ' ' + ((q[1] - 1.5) * px + y0 - cy).toFixed(3)).join('L') + 'Z').join('');
      if (path) svg += `<path d="${path}" fill="${!mover ? '@T' : '#FFFFFF'}" fill-rule="evenodd" stroke="#16191D" stroke-width=".02" stroke-linejoin="round"/>`;
    }
    // lens(ler): hareketlide alttan görünen hüzme yüzeyleri
    // Planda okunurluk (6 Kas, Gökhan "sönük"): tek lens en az gövdenin %16'sı; çok pikselli cihazda pikseller tek renkli bir lens yüzeyinin üstünde.
    if (mover) { const seen = new Set(), L = [];
      for (const bi of beams) { const m = mul(pre, W[bi]), o = ap(m, 0, 0, 0), d = ap(m, 0, 0, -1); if (d[2] - o[2] > -0.5) continue; const r = fx.g[bi][4] || 0.04, k = Math.round(o[0] * 200) + ',' + Math.round(o[1] * 200); if (seen.has(k)) continue; seen.add(k);
        L.push({ x: o[0] - cx, y: -o[1] - cy, r: Math.max(.012, r) }); }
      if (L.length > 4) { let mx = 0, my = 0; L.forEach(q => { mx += q.x; my += q.y; }); mx /= L.length; my /= L.length; let rr = 0; L.forEach(q => { rr = Math.max(rr, Math.hypot(q.x - mx, q.y - my) + q.r); });
        svg += `<circle cx="${mx.toFixed(3)}" cy="${my.toFixed(3)}" r="${(rr + .008).toFixed(3)}" fill="@T" stroke="#16191D" stroke-width=".018"/>`;
        L.forEach(q => { svg += `<circle cx="${q.x.toFixed(3)}" cy="${q.y.toFixed(3)}" r="${q.r.toFixed(3)}" fill="@T" stroke="#16191D" stroke-width=".006"/>`; }); }
      else { const rm = .16 * Math.min(w, l); L.forEach(q => { svg += `<circle cx="${q.x.toFixed(3)}" cy="${q.y.toFixed(3)}" r="${Math.max(q.r, L.length === 1 ? rm : 0).toFixed(3)}" fill="@T" stroke="#16191D" stroke-width=".016"/>`; }); } }
    return { svg, w: +w.toFixed(3), l: +l.toFixed(3) };
  }
  function isDesc(fx, i, anc) { let p = fx.g[i][0], d = 0; while (p >= 0 && d < 40) { if (p === anc) return true; p = fx.g[p][0]; d++; } return false; }
  function rasterTri(g, w, h, t) {
    const [a, b, c] = t, minx = Math.max(0, Math.floor(Math.min(a[0], b[0], c[0]))), maxx = Math.min(w - 1, Math.ceil(Math.max(a[0], b[0], c[0]))), miny = Math.max(0, Math.floor(Math.min(a[1], b[1], c[1]))), maxy = Math.min(h - 1, Math.ceil(Math.max(a[1], b[1], c[1])));
    const e = (p, q, x, y) => (q[0] - p[0]) * (y - p[1]) - (q[1] - p[1]) * (x - p[0]), ar = e(a, b, c[0], c[1]); if (Math.abs(ar) < 1e-9) { // çizgi gibi üçgen: kenarları boya
      for (const [p, q] of [[a, b], [b, c], [c, a]]) { const n = Math.ceil(Math.hypot(q[0] - p[0], q[1] - p[1])) + 1; for (let i = 0; i <= n; i++) { const x = Math.round(p[0] + (q[0] - p[0]) * i / n), y = Math.round(p[1] + (q[1] - p[1]) * i / n); if (x >= 0 && y >= 0 && x < w && y < h) g[y * w + x] = 1; } } return; }
    for (let y = miny; y <= maxy; y++) for (let x = minx; x <= maxx; x++) { const px = x + .5, py = y + .5, w0 = e(b, c, px, py), w1 = e(c, a, px, py), w2 = e(a, b, px, py); if ((w0 >= -.5 * Math.abs(ar) / 40 && w1 >= -.5 * Math.abs(ar) / 40 && w2 >= -.5 * Math.abs(ar) / 40) || (w0 <= .5 * Math.abs(ar) / 40 && w1 <= .5 * Math.abs(ar) / 40 && w2 <= .5 * Math.abs(ar) / 40)) g[y * w + x] = 1; }
  }
  // marching squares: dolu hücre kenarlarından kapalı çizgiler
  function contours(g, w, h) {
    const at = (x, y) => x >= 0 && y >= 0 && x < w && y < h && g[y * w + x];
    const edges = new Map(), add = (a, b) => { edges.set(a[0] + ',' + a[1], b); };
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { if (!at(x, y)) continue;
      if (!at(x, y - 1)) add([x, y], [x + 1, y]); if (!at(x + 1, y)) add([x + 1, y], [x + 1, y + 1]);
      if (!at(x, y + 1)) add([x + 1, y + 1], [x, y + 1]); if (!at(x - 1, y)) add([x, y + 1], [x, y]); }
    const out = [];
    while (edges.size) { const [k0, v0] = edges.entries().next().value; edges.delete(k0); const s = k0.split(',').map(Number), poly = [s]; let cur = v0, n = 0;
      while (n++ < 100000) { poly.push(cur); const k = cur[0] + ',' + cur[1]; if (k === k0) break; const nx = edges.get(k); if (!nx) break; edges.delete(k); cur = nx; }
      if (poly.length > 4) out.push(poly); }
    return out;
  }
  function simplify(p, tol) {
    if (p.length > 4 && p[0][0] === p[p.length - 1][0] && p[0][1] === p[p.length - 1][1]) { // kapalı: en uzak noktadan ikiye böl
      let fi = 1, fd = -1; for (let i = 1; i < p.length - 1; i++) { const d = Math.hypot(p[i][0] - p[0][0], p[i][1] - p[0][1]); if (d > fd) { fd = d; fi = i; } }
      const a = simplifyOpen(p.slice(0, fi + 1), tol), b = simplifyOpen(p.slice(fi), tol); return a.concat(b.slice(1, -1)); }
    return simplifyOpen(p, tol);
  }
  function simplifyOpen(p, tol) {
    if (p.length < 4) return p; const keep = new Uint8Array(p.length); keep[0] = keep[p.length - 1] = 1;
    (function rdp(a, b) { let md = 0, mi = -1; const [x1, y1] = p[a], [x2, y2] = p[b], L = Math.hypot(x2 - x1, y2 - y1) || 1;
      for (let i = a + 1; i < b; i++) { const d = Math.abs((x2 - x1) * (y1 - p[i][1]) - (x1 - p[i][0]) * (y2 - y1)) / L; if (d > md) { md = d; mi = i; } }
      if (md > tol && mi > 0) { keep[mi] = 1; rdp(a, mi); rdp(mi, b); } })(0, p.length - 1);
    return p.filter((_, i) => keep[i]);
  }
  const api = { convert, unpack, worldMats, mul, ap, rotX, rotZ, key, keysFor, parseXML };
  G.FX3D_CONV = api; if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
