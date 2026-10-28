// Every Joule KZ — кітап қозғалтқышы: 3D сахна, сабақ қадамдары, мөрлер.
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import LESSONS from "./lessons.js";

const $ = (id) => document.getElementById(id);
const INK = 0x23212b, PAPER = 0xfbf6ea;
export const COLORS = {
  kin: "#2f8cff", grav: "#7c5cff", elas: "#1fa774", heat: "#e5484d", chem: "#f2a516",
  mag: "#d6409f", elec: "#13a8c4", light: "#f5c518", lost: "#8a8494", total: "#23212b",
};

// ---------- Сақтау (мөрлер мен болжамдар) ----------
const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem("ar-joule:" + k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem("ar-joule:" + k, JSON.stringify(v)); } catch {} },
};
let stamps = store.get("stamps", {});
let picks = store.get("picks", {});

// ---------- 3D сахна ----------
const host = $("stage");
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
host.prepend(renderer.domElement);
const scene = new THREE.Scene();
scene.background = new THREE.Color(PAPER);
scene.fog = new THREE.Fog(PAPER, 30, 70);
const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 200);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; controls.maxPolarAngle = Math.PI * 0.49;
controls.minDistance = 3; controls.maxDistance = 45;
scene.add(new THREE.HemisphereLight(0xffffff, 0xd9ccb0, 1.6));
const sun = new THREE.DirectionalLight(0xffffff, 1.4); sun.position.set(5, 10, 6); scene.add(sun);

// Кітап беті: суреттер осы беттен «көтеріледі»
const pageMesh = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.MeshLambertMaterial({ color: 0xf4ecd9 }));
pageMesh.rotation.x = -Math.PI / 2; pageMesh.position.y = -0.001; scene.add(pageMesh);
const grid = new THREE.GridHelper(80, 80, 0xe2d6bc, 0xe9dfc8); scene.add(grid);

const world = new THREE.Group(); scene.add(world);
let particles = [];
let current = null;

function resize() {
  const r = host.getBoundingClientRect();
  renderer.setSize(r.width, r.height, false);
  camera.aspect = r.width / Math.max(1, r.height); camera.updateProjectionMatrix(); applyCam();
}
new ResizeObserver(resize).observe(host);

// ---------- Сахна көмекшілері ----------
const edgeMat = new THREE.LineBasicMaterial({ color: INK });
function ink(geo, color = "#fbf6ea", opts = {}) {
  const { edges, ...mopts } = opts;
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.85, flatShading: true, ...mopts });
  const mesh = new THREE.Mesh(geo, mat);
  if (edges !== false) mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo, 25), edgeMat));
  world.add(mesh);
  return mesh;
}
const glowTex = (() => {
  const c = document.createElement("canvas"); c.width = c.height = 64;
  const g = c.getContext("2d"), grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, "rgba(255,255,255,1)"); grd.addColorStop(0.3, "rgba(255,255,255,.8)"); grd.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grd; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c);
})();
function glow(color, size = 0.5) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  s.scale.setScalar(size); world.add(s); return s;
}
// Энергия ағыны: жарқыраған бөлшектер A нүктесінен B нүктесіне доғамен ұшады
function flow(from, to, color, n = 12, dur = 1.1, arc = 1) {
  for (let i = 0; i < n; i++) {
    const s = glow(color, 0.35 + Math.random() * 0.25);
    s.visible = false;
    particles.push({ s, from: from.clone(), to: to.clone(), t: -i * (dur / n) * 0.8, dur, arc: arc * (0.6 + Math.random() * 0.8), jitter: new THREE.Vector3((Math.random() - .5) * .4, 0, (Math.random() - .5) * .4) });
  }
}
function updateParticles(dt) {
  particles = particles.filter((p) => {
    p.t += dt;
    if (p.t < 0) return true;
    const k = p.t / p.dur;
    if (k >= 1) { world.remove(p.s); p.s.material.dispose(); return false; }
    p.s.visible = true;
    p.s.position.lerpVectors(p.from, p.to, k).add(p.jitter.clone().multiplyScalar(Math.sin(k * Math.PI)));
    p.s.position.y += Math.sin(k * Math.PI) * p.arc;
    p.s.material.opacity = Math.sin(k * Math.PI);
    return true;
  });
}
function label(text, pos, color = "#23212b", size = 1) {
  const c = document.createElement("canvas"), g = c.getContext("2d");
  const font = "700 44px Inter, sans-serif"; g.font = font;
  const w = Math.ceil(g.measureText(text).width) + 36; c.width = w; c.height = 72;
  g.font = font; g.fillStyle = "#fbf6ea"; g.strokeStyle = "#23212b"; g.lineWidth = 4;
  g.beginPath(); g.roundRect(2, 2, w - 4, 68, 30); g.fill(); g.stroke();
  g.fillStyle = color; g.textBaseline = "middle"; g.fillText(text, 18, 38);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true }));
  s.scale.set((w / 72) * 0.5 * size, 0.5 * size, 1); s.position.copy(pos); s.renderOrder = 10;
  world.add(s); return s;
}
let camBase = null;
function cam(pos, target) { camBase = { pos, target }; applyCam(); }
function applyCam() {
  if (!camBase) return;
  const t = new THREE.Vector3(...camBase.target), f = Math.min(2.2, Math.max(1, 1.3 / camera.aspect));
  camera.position.copy(new THREE.Vector3(...camBase.pos).sub(t).multiplyScalar(f).add(t));
  controls.target.copy(t); controls.update();
}
function clearWorld() {
  particles = [];
  while (world.children.length) {
    const o = world.children.pop();
    o.traverse((m) => { m.geometry?.dispose?.(); if (m.material && m.material !== edgeMat) m.material.dispose?.(); });
  }
}
// Нысанды басу (сүйреумен шатастырмау үшін)
let clickTargets = [], down = null;
renderer.domElement.addEventListener("pointerdown", (e) => { down = { x: e.clientX, y: e.clientY }; });
renderer.domElement.addEventListener("pointerup", (e) => {
  if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 6 || !clickTargets.length) return;
  const r = renderer.domElement.getBoundingClientRect();
  const ray = new THREE.Raycaster();
  ray.setFromCamera(new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), camera);
  const hit = ray.intersectObjects(clickTargets.map((t) => t.obj), true)[0];
  if (!hit) return;
  const t = clickTargets.find((t) => { let o = hit.object; while (o) { if (o === t.obj) return true; o = o.parent; } return false; });
  t?.on();
});
function clickable(obj, on) { clickTargets.push({ obj, on }); }

// ---------- Бет элементтері (UI) ----------
const ui = {
  slider({ label: l, min, max, step, value, fmt = (v) => v, on }) {
    const lab = document.createElement("label");
    lab.innerHTML = `${l} <output></output><input type="range" min="${min}" max="${max}" step="${step}" value="${value}">`;
    const inp = lab.querySelector("input"), out = lab.querySelector("output");
    const fire = () => { out.textContent = fmt(+inp.value); on(+inp.value); };
    inp.addEventListener("input", fire); $("controls").append(lab); out.textContent = fmt(value);
    return inp;
  },
  chips(items, value, on) {
    const row = document.createElement("div"); row.className = "row";
    items.forEach((it) => {
      const b = document.createElement("button"); b.className = "chip" + (it.value === value ? " on" : ""); b.textContent = it.label;
      b.onclick = () => { row.querySelectorAll(".chip").forEach((x) => x.classList.toggle("on", x === b)); on(it.value); };
      row.append(b);
    });
    $("controls").append(row); return row;
  },
  button(text, on) {
    let row = $("controls").querySelector(".row.actions");
    if (!row) { row = document.createElement("div"); row.className = "row actions"; $("controls").append(row); }
    const b = document.createElement("button"); b.className = "btn primary"; b.textContent = text; b.onclick = on; row.append(b); return b;
  },
  readout(html) { $("readout").innerHTML = html; },
  bars(defs) {
    $("bars").innerHTML = defs.map((d) => `<div class="bar" data-k="${d.key}"><div class="lbl"><span>${d.label}</span><span class="v"></span></div><div class="track"><div class="fill" style="background:${d.color}"></div></div></div>`).join("");
  },
  setBars(vals, max, fmt = (v) => nf(v, 0) + " Дж") {
    for (const [k, v] of Object.entries(vals)) {
      const el = $("bars").querySelector(`[data-k="${k}"]`); if (!el) continue;
      el.querySelector(".fill").style.width = Math.max(0, Math.min(100, (v / (max || 1)) * 100)) + "%";
      el.querySelector(".v").textContent = fmt(v);
    }
  },
};
export const nf = (v, d = 1) => new Intl.NumberFormat("kk-KZ", { minimumFractionDigits: d, maximumFractionDigits: d }).format(v);
const ctx = { THREE, ink, glow, flow, label, cam, clickable, world, ui, nf, COLORS };

// ---------- Дыбыс: мөр басылғанда ----------
function thunk() {
  try {
    const a = new (window.AudioContext || window.webkitAudioContext)(), o = a.createOscillator(), g = a.createGain();
    o.type = "triangle"; o.frequency.setValueAtTime(180, a.currentTime); o.frequency.exponentialRampToValueAtTime(60, a.currentTime + 0.18);
    g.gain.setValueAtTime(0.4, a.currentTime); g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + 0.25);
    o.connect(g).connect(a.destination); o.start(); o.stop(a.currentTime + 0.3);
  } catch {}
}

// ---------- Мазмұны ----------
function renderToc() {
  $("toc").innerHTML = LESSONS.map((l, i) => `<li><a href="#/${i + 1}">
    ${stamps[i + 1] ? '<span class="got">МӨР</span>' : ""}
    <span class="n">${i + 1}-сабақ</span><b>${l.title}</b><small>${l.sub}</small></a></li>`).join("");
  $("stamp-count").textContent = Object.keys(stamps).length;
}

// ---------- Сабақ ----------
function showStep(n) {
  document.querySelectorAll(".steps button").forEach((b) => b.setAttribute("aria-selected", String(+b.dataset.step === n)));
  [0, 1, 2].forEach((i) => ($("step-" + i).hidden = i !== n));
}
document.querySelectorAll(".steps button").forEach((b) => (b.onclick = () => showStep(+b.dataset.step)));

function openLesson(n) {
  const L = LESSONS[n - 1];
  $("l-num").textContent = `${n}-сабақ / 10`;
  $("l-title").textContent = L.title;
  $("l-intro").textContent = L.intro;
  $("seal").hidden = true;

  // 1. Болжа
  $("p-q").textContent = L.predict.q;
  $("p-opts").innerHTML = "";
  $("p-note").textContent = "";
  L.predict.opts.forEach((o, i) => {
    const b = document.createElement("button"); b.textContent = o;
    if (picks[n] === i) b.classList.add("picked");
    b.onclick = () => {
      picks[n] = i; store.set("picks", picks);
      $("p-opts").querySelectorAll("button").forEach((x) => x.classList.toggle("picked", x === b));
      $("p-note").innerHTML = 'Болжамың жазылды. Енді <a href="javascript:void 0" id="go-test">тексер →</a>';
      $("go-test").onclick = () => showStep(1);
    };
    $("p-opts").append(b);
  });

  // 2. Тексер
  $("t-hint").innerHTML = L.hint;
  $("controls").innerHTML = ""; $("readout").innerHTML = ""; $("bars").innerHTML = "";
  clearWorld(); clickTargets = [];
  current = L.setup(ctx) || {};

  // 3. Дәлелде
  $("proof").innerHTML = L.proof;
  $("flap").classList.remove("open");
  const correct = L.predict.opts[L.predict.correct];
  $("flap-inner").innerHTML = `<p><b>Жауап:</b> ${correct}</p><p>${L.predict.why}</p><p class="note" id="flap-note"></p>`;
  $("flap-btn").onclick = () => {
    $("flap").classList.add("open");
    const ok = picks[n] === L.predict.correct;
    $("flap-note").textContent = picks[n] == null ? "Келесі жолы алдымен болжап көр — солай қызықтырақ."
      : ok ? "Болжамың дұрыс! Мөр саған." : "Болжамың басқаша болды — тәжірибе не көрсеткенін салыстыр. Сабақ аяқталды, мөр саған.";
    $("seal").querySelector("span").innerHTML = ok ? "ДҰРЫС<br>БОЛЖАМ" : "САБАҚ<br>ӨТТІ";
    $("seal").hidden = false; thunk();
    stamps[n] = ok ? "ok" : "done"; store.set("stamps", stamps); renderToc();
  };

  const prev = $("prev"), next = $("next");
  prev.href = `#/${n - 1}`; prev.setAttribute("aria-disabled", String(n === 1));
  next.href = n === 10 ? "#/" : `#/${n + 1}`; next.textContent = n === 10 ? "Мазмұнға →" : "Келесі →";
  showStep(0);
  resize();
}

function route() {
  const n = parseInt(location.hash.replace("#/", ""), 10);
  const inLesson = n >= 1 && n <= LESSONS.length;
  $("cover").hidden = inLesson; $("lesson").hidden = !inLesson;
  if (inLesson) openLesson(n); else { current = null; renderToc(); }
  window.scrollTo(0, 0);
}
window.addEventListener("hashchange", route);
route();

// ---------- Анимация циклы ----------
const clock = new THREE.Clock();
renderer.setAnimationLoop(() => {
  if ($("lesson").hidden) return;
  const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;
  current?.update?.(dt, t);
  updateParticles(dt);
  controls.update();
  renderer.render(scene, camera);
});
