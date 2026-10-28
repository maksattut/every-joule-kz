// Every Joule KZ — 10 сабақ. Әр сабақ: болжа → тексер (3D) → дәлелде.
const G = 9.8;

function helix(THREE, turns = 9, r = 0.32, tube = 0.045) {
  const pts = [], N = turns * 20;
  for (let i = 0; i <= N; i++) {
    const a = (i / N) * turns * Math.PI * 2;
    pts.push(new THREE.Vector3(i / N, Math.cos(a) * r, Math.sin(a) * r));
  }
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), N * 2, tube, 6, false);
}
const box = (T, w, h, d) => new T.BoxGeometry(w, h, d);
const burst = (flow, T, p, color, n = 4) => {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    flow(p, new T.Vector3(p.x + Math.cos(a) * 1.4, 0.15, p.z + Math.sin(a) * 1.4), color, 3, 0.8, 0.6);
  }
};

export default [
  // ───────────────────────── 1 ─────────────────────────
  {
    title: "Энергия қорлары",
    sub: "Күнделікті заттар және олардың энергиясы қай қорда сақталады",
    intro: "Энергия жоғалмайды және жоқтан пайда болмайды — ол әртүрлі «қорларда» сақталып, бір қордан екіншісіне ауысады.",
    predict: {
      q: "Төмендегілердің қайсысында энергия кинетикалық қорда сақталған?",
      opts: ["Батарея", "Домалап бара жатқан доп", "Сөредегі кітап", "Ыстық шай"],
      correct: 1,
      why: "Кинетикалық қор — қозғалыстағы дененің энергиясы. Батареяда — химиялық, сөредегі кітапта — гравитациялық потенциалдық, ыстық шайда — жылулық қор.",
    },
    hint: "Сахнадағы әр затты бас. Оның энергиясы қай қорда сақталғанын тап. Барлығы — 6 қор.",
    setup({ THREE: T, ink, flow, label, cam, clickable, world, ui, COLORS: C }) {
      cam([7, 6.5, 9], [0, 1, 0]);
      const V = (x, y, z) => new T.Vector3(x, y, z);
      const group = (...m) => { const g = new T.Group(); world.add(g); m.forEach((x) => g.add(x)); return g; };
      const items = [];
      // Батарея — химиялық
      const bat = ink(new T.CylinderGeometry(0.35, 0.35, 1.1, 24), "#f2c46b"); bat.position.set(-3, 0.55, 0.6);
      const cap = ink(new T.CylinderGeometry(0.14, 0.14, 0.15, 16), "#c9c2b0"); cap.position.set(-3, 1.18, 0.6);
      items.push({ obj: group(bat, cap), key: "chem", name: "Химиялық", at: V(-3, 0.6, 0.6) });
      // Созылған серіппе — серпімділік
      const p1 = ink(box(T, 0.2, 1.2, 0.2), "#d8c9a8"); p1.position.set(-1.6, 0.6, 2.4);
      const p2 = ink(box(T, 0.2, 1.2, 0.2), "#d8c9a8"); p2.position.set(0.6, 0.6, 2.4);
      const spr = ink(helix(T, 12, 0.18, 0.035), "#59c08a", { edges: false }); spr.position.set(-1.5, 1, 2.4); spr.scale.x = 2;
      items.push({ obj: group(p1, p2, spr), key: "elas", name: "Серпімділік", at: V(-0.5, 1, 2.4) });
      // Сөредегі кітап — гравитациялық
      const post = ink(box(T, 0.15, 2.6, 0.15), "#d8c9a8"); post.position.set(2.6, 1.3, -1.6);
      const shelf = ink(box(T, 1.6, 0.1, 0.8), "#d8c9a8"); shelf.position.set(3.2, 2.6, -1.6);
      const book = ink(box(T, 0.9, 0.25, 0.65), "#7c5cff"); book.position.set(3.2, 2.78, -1.6);
      items.push({ obj: group(post, shelf, book), key: "grav", name: "Гравитациялық", at: V(3.2, 2.8, -1.6) });
      // Ыстық шай — жылулық
      const cup = ink(new T.CylinderGeometry(0.42, 0.34, 0.8, 24), "#f4f0e6"); cup.position.set(2.8, 0.4, 2);
      const tea = ink(new T.CylinderGeometry(0.38, 0.38, 0.05, 24), "#b5653a", { edges: false }); tea.position.set(2.8, 0.72, 2);
      items.push({ obj: group(cup, tea), key: "heat", name: "Жылулық", at: V(2.8, 0.8, 2) });
      // Домалап бара жатқан доп — кинетикалық
      const ball = ink(new T.IcosahedronGeometry(0.45, 1), "#5aa7ff"); ball.position.set(0, 0.45, -2.6);
      items.push({ obj: ball, key: "kin", name: "Кинетикалық", at: ball.position, moving: true });
      // Магнит — магниттік
      const mN = ink(box(T, 0.7, 0.35, 0.4), "#e5484d"); mN.position.set(-3.2, 0.18, -1.6);
      const mS = ink(box(T, 0.7, 0.35, 0.4), "#5aa7ff"); mS.position.set(-2.5, 0.18, -1.6);
      const clip = ink(new T.TorusGeometry(0.15, 0.03, 6, 16), "#8a8494"); clip.position.set(-1.9, 0.18, -1.6);
      items.push({ obj: group(mN, mS, clip), key: "mag", name: "Магниттік", at: V(-2.8, 0.4, -1.6) });

      const defs = [["kin", "Кинетикалық"], ["grav", "Гравитациялық"], ["elas", "Серпімділік"], ["heat", "Жылулық"], ["chem", "Химиялық"], ["mag", "Магниттік"]];
      ui.bars(defs.map(([key, l]) => ({ key, label: l, color: C[key] })));
      const found = new Set();
      const show = () => {
        ui.setBars(Object.fromEntries(defs.map(([k]) => [k, found.has(k) ? 1 : 0])), 1, (v) => (v ? "табылды" : "?"));
        ui.readout(found.size === 6 ? "<b>Барлық 6 қор табылды!</b> Тағы екі қор бар: электростатикалық және ядролық. «Дәлелде» қадамына өт."
          : `Табылған қорлар: <b>${found.size} / 6</b>`);
      };
      show();
      items.forEach((it) => clickable(it.obj, () => {
        const p = it.at.clone();
        flow(p, p.clone().add(V(0, 1.6, 0)), C[it.key], 14, 1, 0.4);
        if (!found.has(it.key)) { found.add(it.key); label(it.name, p.clone().add(V(0, 1.8, 0)), C[it.key], 0.9); }
        show();
      }));
      return {
        update(dt, t) {
          ball.position.x = Math.sin(t * 0.8) * 2.4;
          ball.rotation.z = -ball.position.x / 0.45;
        },
      };
    },
    proof: `<h3>Энергияның 8 қоры</h3>
      <ul><li><b>Кинетикалық</b> — қозғалыстағы дене</li><li><b>Гравитациялық потенциалдық</b> — жоғары көтерілген дене</li>
      <li><b>Серпімділік</b> — созылған не сығылған дене</li><li><b>Жылулық (ішкі)</b> — ыстық дене</li>
      <li><b>Химиялық</b> — отын, тамақ, батарея</li><li><b>Магниттік</b> — тартылатын не тебілетін магниттер</li>
      <li><b>Электростатикалық</b> — зарядтар</li><li><b>Ядролық</b> — атом ядросы</li></ul>
      <h3>Энергия қалай ауысады</h3>
      <p>Механикалық жұмыс, электр тогы, қыздыру және сәулелену (жарық, дыбыс) арқылы.</p>
      <div class="formula">1 Дж = 1 Н × 1 м<small>1 джоуль — 1 ньютон күш денені 1 метрге жылжытқандағы жұмыс</small></div>`,
  },

  // ───────────────────────── 2 ─────────────────────────
  {
    title: "Кинетикалық және гравитациялық энергия",
    sub: "Құлаған доп: биіктік жылдамдыққа айналады",
    intro: "Жоғары көтерілген доптың энергиясы гравитациялық қорда. Құлағанда ол кинетикалық қорға ауысады.",
    predict: {
      q: "Доп 4 есе биіктен құласа, жерге соғылар кездегі жылдамдығы қалай өзгереді?",
      opts: ["4 есе артады", "2 есе артады", "16 есе артады", "Өзгермейді"],
      correct: 1,
      why: "mgh = ½mv², сондықтан v = √(2gh). Биіктік 4 есе артса, жылдамдық √4 = 2 есе ғана артады. Масса формуладан қысқарады!",
    },
    hint: "Биіктік пен массаны таңда, сосын «Тастау» батырмасын бас. Энергия бағаналарын бақыла.",
    setup({ THREE: T, ink, flow, cam, ui, nf, COLORS: C }) {
      cam([6.5, 4, 9], [0, 2.6, 0]);
      const S = 0.5;
      const pole = ink(box(T, 0.14, 5.6, 0.14), "#e9dfc8"); pole.position.set(-1.3, 2.8, 0);
      for (let i = 1; i <= 10; i++) { const k = ink(box(T, i % 5 ? 0.25 : 0.5, 0.035, 0.05), "#23212b", { edges: false }); k.position.set(-1.1, i * S, 0); }
      const arm = ink(box(T, 1.6, 0.1, 0.25), "#d8c9a8");
      const magnet = ink(box(T, 0.4, 0.2, 0.4), "#e5484d");
      const ball = ink(new T.IcosahedronGeometry(0.3, 2), "#5aa7ff");
      ui.bars([{ key: "ep", label: "Гравитациялық Eп", color: C.grav }, { key: "ek", label: "Кинетикалық Eк", color: C.kin }]);
      let h = 5, m = 1, y, v, state;
      const reset = () => {
        y = h; v = 0; state = "ready";
        arm.position.set(-0.5, h * S + 0.72, 0); magnet.position.set(0.1, h * S + 0.55, 0);
        ball.position.set(0.1, h * S + 0.3, 0);
      };
      const show = () => {
        const ep = m * G * y, ek = 0.5 * m * v * v;
        ui.setBars({ ep, ek }, m * G * h);
        ui.readout(`h = <b>${nf(y, 2)} м</b> · v = <b>${nf(v, 2)} м/с</b><br>Eп + Eк = <b>${nf(ep + ek, 1)} Дж</b>` +
          (state === "landed" ? `<br>Жерге соғылар кезде: v = √(2gh) = <b>${nf(Math.sqrt(2 * G * h), 2)} м/с</b>` : ""));
      };
      ui.slider({ label: "Биіктік h", min: 1, max: 10, step: 0.5, value: h, fmt: (x) => nf(x, 1) + " м", on: (x) => { h = x; reset(); show(); } });
      ui.slider({ label: "Масса m", min: 0.5, max: 5, step: 0.5, value: m, fmt: (x) => nf(x, 1) + " кг", on: (x) => { m = x; reset(); show(); } });
      ui.button("Тастау", () => { if (state !== "ready") reset(); state = "fall"; });
      ui.button("Қайта бастау", () => { reset(); show(); });
      reset(); show();
      return {
        update(dt) {
          if (state !== "fall") return;
          v += G * dt; y -= v * dt;
          if (y <= 0) { y = 0; v = Math.sqrt(2 * G * h); state = "landed"; show(); burst(flow, T, ball.position.clone(), C.heat); ball.position.y = 0.3; return; }
          ball.position.y = y * S + 0.3; ball.rotation.x += dt * 2; show();
        },
      };
    },
    proof: `<p>Құлау кезінде гравитациялық қордағы энергия кинетикалық қорға ауысады (ауаның кедергісін ескермейміз):</p>
      <div class="formula">Eп = mgh &nbsp;&nbsp; Eк = ½mv²<small>m — масса (кг), g = 9,8 Н/кг, h — биіктік (м), v — жылдамдық (м/с)</small></div>
      <div class="formula">mgh = ½mv² ⇒ v = √(2gh)</div>
      <p><b>Мысал:</b> h = 5 м болса, v = √(2 × 9,8 × 5) ≈ 9,9 м/с. h = 20 м болса, v ≈ 19,8 м/с — биіктік 4 есе, жылдамдық тек 2 есе.</p>
      <p>Масса қысқарады: ауыр доп пен жеңіл доп (ауасыз ортада) бірдей жылдамдықпен түседі.</p>`,
  },

  // ───────────────────────── 3 ─────────────────────────
  {
    title: "Серпімділік энергиясы",
    sub: "Сығылған серіппе: созылу мен энергияның байланысы",
    intro: "Серіппені сыққанда немесе созғанда жұмыс жасаймыз — бұл энергия серпімділік қорында жиналады.",
    predict: {
      q: "Серіппені 2 есе көбірек сықсақ, онда жиналған энергия қалай өзгереді?",
      opts: ["2 есе артады", "4 есе артады", "Өзгермейді", "Екі есе азаяды"],
      correct: 1,
      why: "Eс = ½ke². Сығылу e екі есе артса, e² төрт есе артады — энергия да 4 есе көбейеді.",
    },
    hint: "Сығылу шамасы мен серіппенің қатаңдығын таңда, сосын «Жіберу» бас. Блок қандай жылдамдықпен ұшатынын бақыла.",
    setup({ THREE: T, ink, flow, cam, ui, nf, COLORS: C }) {
      cam([1, 4, 10], [0.5, 0.8, 0]);
      const SX = 8, L0 = 2.6, X0 = -3.05;
      const wall = ink(box(T, 0.3, 1.8, 1.8), "#d8c9a8"); wall.position.set(-3.2, 0.9, 0);
      const track = ink(box(T, 10.5, 0.08, 1.2), "#e9dfc8"); track.position.set(1.7, 0.04, 0);
      const spr = ink(helix(T, 10, 0.32, 0.05), "#1fa774", { edges: false }); spr.position.set(X0, 0.6, 0);
      const block = ink(box(T, 0.8, 0.8, 0.8), "#f2a516");
      ui.bars([{ key: "ee", label: "Серпімділік Eс", color: C.elas }, { key: "ek", label: "Кинетикалық Eк", color: C.kin }]);
      let e = 0.1, k = 200, m = 0.5, c, v, xs, state;
      const reset = () => { c = e; v = 0; xs = 0; state = "ready"; place(); show(); };
      const place = () => {
        const len = Math.max(0.3, L0 - c * SX);
        spr.scale.x = len;
        block.position.set(X0 + (state === "free" ? L0 + xs : len) + 0.4, 0.48, 0);
      };
      const show = () => {
        const ee = 0.5 * k * c * c, ek = 0.5 * m * v * v;
        ui.setBars({ ee, ek }, 0.5 * k * e * e, (x) => nf(x, 2) + " Дж");
        ui.readout(`e = <b>${nf(c, 3)} м</b> · Eс = ½ke² = <b>${nf(ee, 2)} Дж</b><br>v = <b>${nf(v, 2)} м/с</b>` +
          (state === "free" ? ` · есептелген: e√(k/m) = <b>${nf(e * Math.sqrt(k / m), 2)} м/с</b>` : ""));
      };
      ui.slider({ label: "Сығылу e", min: 0.02, max: 0.2, step: 0.01, value: e, fmt: (x) => nf(x, 2) + " м", on: (x) => { e = x; reset(); } });
      ui.chips([{ label: "k = 100 Н/м", value: 100 }, { label: "k = 200 Н/м", value: 200 }, { label: "k = 400 Н/м", value: 400 }], k, (x) => { k = x; reset(); });
      ui.button("Жіберу", () => { reset(); state = "push"; });
      reset();
      return {
        update(dt) {
          if (state === "ready" || state === "done") return;
          const d = dt * 0.25; // баяулатылған уақыт
          if (state === "push") {
            v += (k * c / m) * d; c -= v * d;
            if (c <= 0) { c = 0; v = e * Math.sqrt(k / m); state = "free"; flow(spr.position.clone().add(new T.Vector3(1.3, 0, 0)), block.position.clone(), C.elas, 10, 0.6, 0.6); }
          } else if (state === "free") {
            xs += v * d * SX;
            if (block.position.x > 6) state = "done";
          }
          place(); show();
        },
      };
    },
    proof: `<p>Серіппені созуға не сығуға жұмсалған жұмыс серпімділік қорына жиналады (серпімділік шегінен аспасақ):</p>
      <div class="formula">Eс = ½ k e²<small>k — серіппенің қатаңдығы (Н/м), e — созылу не сығылу (м)</small></div>
      <p><b>Мысал:</b> k = 200 Н/м, e = 0,1 м → Eс = ½ × 200 × 0,01 = <b>1 Дж</b>. e = 0,2 м → <b>4 Дж</b>.</p>
      <p>Жіберілгенде бұл энергия блоктың кинетикалық қорына ауысады: ½ke² = ½mv² ⇒ v = e√(k/m).</p>`,
  },

  // ───────────────────────── 4 ─────────────────────────
  {
    title: "Секірген доп неге тоқтайды",
    sub: "Әр соққыда энергия қайда кетеді",
    intro: "Доп әр жолы алдыңғыдан төменірек секіреді. Энергия жоғалмайды — ол басқа қорларға ауысады.",
    predict: {
      q: "Секірген доп неге бірте-бірте тоқтайды?",
      opts: ["Энергия жоғалып кетеді", "Әр соққыда энергияның бір бөлігі жылу мен дыбысқа ауысады", "Ауырлық күші әлсірейді", "Доп энергияны ішіне жинап алады"],
      correct: 1,
      why: "Соққы кезінде доп пен еден сәл қызады, дыбыс шығады. Бұл энергия қоршаған ортаға тарайды — қайтып допқа оралмайды. Жалпы энергия сақталады.",
    },
    hint: "Доптың түрін таңда да «Тастау» бас. Жасыл бағана емес, қызыл «жылу мен дыбыс» бағанасының өсуін бақыла.",
    setup({ THREE: T, ink, flow, cam, ui, nf, COLORS: C }) {
      cam([6, 3.5, 8], [0, 1.4, 0]);
      const S = 1.2, h0 = 2, m = 0.1;
      const pole = ink(box(T, 0.14, 3.2, 0.14), "#e9dfc8"); pole.position.set(-1.3, 1.6, 0);
      const arm = ink(box(T, 1.5, 0.1, 0.25), "#d8c9a8"); arm.position.set(-0.55, h0 * S + 0.72, 0);
      const ball = ink(new T.IcosahedronGeometry(0.3, 2), "#e5484d");
      ui.bars([{ key: "ep", label: "Гравитациялық Eп", color: C.grav }, { key: "ek", label: "Кинетикалық Eк", color: C.kin }, { key: "lost", label: "Жылу мен дыбыс", color: C.heat }]);
      let e = 0.75, y, v, lost, n, peaks, state;
      const E0 = m * G * h0;
      const reset = () => { y = h0; v = 0; lost = 0; n = 0; peaks = []; state = "ready"; ball.position.set(0.1, h0 * S + 0.3, 0); show(); };
      const show = () => {
        const ep = m * G * y, ek = 0.5 * m * v * v;
        ui.setBars({ ep, ek, lost }, E0, (x) => nf(x, 2) + " Дж");
        ui.readout(`Секіру саны: <b>${n}</b> · Жалпы: <b>${nf(ep + ek + lost, 2)} Дж</b> (тұрақты)` +
          (peaks.length ? `<br>Биіктіктер: ${peaks.slice(0, 5).map((p) => nf(p * 100, 0) + " см").join(" → ")}` : ""));
      };
      ui.chips([{ label: "Резеңке доп", value: 0.85 }, { label: "Теннис добы", value: 0.75 }, { label: "Пластилин", value: 0.12 }], e, (x) => { e = x; reset(); });
      ui.button("Тастау", () => { reset(); state = "run"; });
      reset();
      return {
        update(dt) {
          if (state !== "run") return;
          v -= G * dt; y += v * dt;
          if (y <= 0 && v < 0) {
            y = 0; const before = 0.5 * m * v * v; v = -v * e; const after = 0.5 * m * v * v;
            lost += before - after; n++; peaks.push((v * v) / (2 * G));
            burst(flow, T, new T.Vector3(0.1, 0.1, 0), C.heat, 2 + Math.round((1 - e) * 4));
            if (v < 0.2) { lost += after; v = 0; state = "done"; }
          }
          ball.position.y = y * S + 0.3; show();
        },
      };
    },
    proof: `<p>Әр соққыда жылдамдық <i>e</i> есе азаяды (<i>e</i> — қалпына келу коэффициенті), ал энергия <i>e²</i> есе:</p>
      <div class="formula">h₁ = e² · h₀</div>
      <p><b>Мысал:</b> теннис добы үшін e ≈ 0,75 → h₁ ≈ 0,56 h₀. Яғни әр соққыда энергияның шамамен 44%-ы жылу мен дыбысқа кетеді.</p>
      <div class="formula">Eп + Eк + Eжылу+дыбыс = const</div>
      <p>Энергия жоғалмайды, тек «пайдасыз» қорға ауысып, қоршаған ортаға тарайды.</p>`,
  },

  // ───────────────────────── 5 ─────────────────────────
  {
    title: "Меншікті жылу сыйымдылығы және оқшаулау",
    sub: "Неге су баяу қызады, ал оқшаулау не береді",
    intro: "Әр затты 1 °C-қа қыздыру үшін әртүрлі энергия керек. Оқшаулау жылудың қоршаған ортаға кетуін азайтады.",
    predict: {
      q: "Массалары бірдей су мен өсімдік майын бірдей қуатпен 2 минут қыздырдық. Қайсысының температурасы көбірек көтеріледі?",
      opts: ["Судың", "Майдың", "Бірдей"],
      correct: 1,
      why: "Судың меншікті жылу сыйымдылығы (≈4200 Дж/(кг·°C)) майдікінен (≈2000) шамамен 2 есе үлкен. Сондықтан бірдей энергиямен май 2 есе көбірек қызады.",
    },
    hint: "Затты таңда, оқшаулауды қос не өшір, «Қыздыру» бас. Қыздырғыш 50 Вт, масса 0,5 кг, уақыт 20 есе жылдамдатылған.",
    setup({ THREE: T, ink, glow, flow, label, cam, ui, nf, COLORS: C }) {
      cam([4, 3.5, 7], [0.4, 1.2, 0]);
      const P = 50, M = 0.5, MAT = { water: { c: 4200, col: "#6fb7ff", n: "Су" }, oil: { c: 2000, col: "#e9c25a", n: "Өсімдік майы" }, al: { c: 900, col: "#b8bcc6", n: "Алюминий" } };
      const heater = ink(new T.CylinderGeometry(1.05, 1.1, 0.3, 32), "#3a3640"); heater.position.y = 0.15;
      const coil = ink(new T.TorusGeometry(0.6, 0.06, 8, 40), "#552222", { edges: false, emissive: "#ff3b1a", emissiveIntensity: 0 }); coil.rotation.x = Math.PI / 2; coil.position.y = 0.32;
      const glass = ink(new T.CylinderGeometry(0.8, 0.8, 1.6, 32, 1, true), "#dfeff7", { transparent: true, opacity: 0.25 }); glass.position.y = 1.1;
      const liquid = ink(new T.CylinderGeometry(0.76, 0.76, 1.1, 32), "#6fb7ff"); liquid.position.y = 0.88;
      const jacket = ink(new T.CylinderGeometry(0.98, 0.98, 1.75, 24, 1, true), "#cdbb94", { transparent: true, opacity: 0.85, side: T.DoubleSide }); jacket.position.y = 1.15;
      const tube = ink(new T.CylinderGeometry(0.08, 0.08, 2.6, 12), "#ffffff", { transparent: true, opacity: 0.5 }); tube.position.set(1.9, 1.5, 0);
      const bulb = ink(new T.SphereGeometry(0.16, 16, 12), "#e5484d"); bulb.position.set(1.9, 0.2, 0);
      const col = ink(new T.CylinderGeometry(0.05, 0.05, 1, 10), "#e5484d", { edges: false }); col.position.x = 1.9;
      [20, 30, 40].forEach((d) => label(d + "°", new T.Vector3(2.45, 0.35 + ((d - 15) / 30) * 2.3, 0), "#23212b", 0.55));
      ui.bars([{ key: "in", label: "Қыздырғыш берді", color: C.chem }, { key: "th", label: "Заттың жылулық қоры", color: C.heat }, { key: "out", label: "Ортаға шығын", color: C.lost }]);
      let mat = "water", ins = false, on = false, T0 = 20, Tc, ts, Ein, Eout, acc = 0;
      const reset = () => { Tc = T0; ts = 0; Ein = 0; Eout = 0; on = false; draw(); };
      const draw = () => {
        const hgt = Math.max(0.02, ((Tc - 15) / 30) * 2.3); col.scale.y = hgt; col.position.y = 0.3 + hgt / 2;
        coil.material.emissiveIntensity = on ? 1.4 : 0; jacket.visible = ins;
        liquid.material.color.set(MAT[mat].col);
        const th = M * MAT[mat].c * (Tc - T0);
        ui.setBars({ in: Ein, th, out: Eout }, P * 120);
        ui.readout(`t = <b>${nf(ts, 0)} с</b> · θ = <b>${nf(Tc, 1)} °C</b> · Δθ = <b>${nf(Tc - T0, 2)} °C</b><br>${MAT[mat].n}: c = ${MAT[mat].c} Дж/(кг·°C)` +
          (ts >= 120 ? "<br><b>2 минут өтті.</b> Басқа затпен салыстырып көр." : ""));
      };
      ui.chips(Object.entries(MAT).map(([k, o]) => ({ label: o.n, value: k })), mat, (x) => { mat = x; reset(); });
      ui.chips([{ label: "Оқшаулаусыз", value: false }, { label: "Оқшаулаумен", value: true }], ins, (x) => { ins = x; reset(); });
      ui.button("Қыздыру", () => { if (ts >= 120) reset(); on = true; });
      ui.button("Қайта бастау", reset);
      reset();
      return {
        update(dt) {
          if (!on) return;
          const d = dt * 20, loss = (ins ? 0.3 : 3) * (Tc - T0);
          Tc += ((P - loss) * d) / (M * MAT[mat].c); Ein += P * d; Eout += loss * d; ts += d;
          acc += dt;
          if (acc > 0.18) {
            acc = 0;
            flow(new T.Vector3((Math.random() - 0.5) * 1.2, 0.35, (Math.random() - 0.5) * 1.2), new T.Vector3(0, 0.9, 0), C.chem, 1, 0.8, 0.2);
            if (!ins && Math.random() < 0.6) flow(new T.Vector3((Math.random() - 0.5), 1.6, (Math.random() - 0.5)), new T.Vector3((Math.random() - 0.5) * 3, 3.4, (Math.random() - 0.5) * 3), C.heat, 1, 1.2, 0.3);
          }
          if (ts >= 120) { ts = 120; on = false; }
          draw();
        },
      };
    },
    proof: `<div class="formula">ΔE = m · c · Δθ<small>m — масса (кг), c — меншікті жылу сыйымдылығы (Дж/(кг·°C)), Δθ — температура өзгерісі (°C)</small></div>
      <p><b>Мысал:</b> 50 Вт × 120 с = 6000 Дж. 0,5 кг су үшін Δθ = 6000 / (0,5 × 4200) ≈ <b>2,9 °C</b>. 0,5 кг май үшін Δθ = 6000 / (0,5 × 2000) = <b>6 °C</b>.</p>
      <p>Оқшаулау (жылуды нашар өткізетін қабат) энергияның қоршаған ортаға кетуін азайтады: үйдің қабырғасы, терезедегі қос әйнек, термос осылай жұмыс істейді.</p>
      <p class="note">c мәндері — шамамен алынған кестелік мәндер.</p>`,
  },

  // ───────────────────────── 6 ─────────────────────────
  {
    title: "Қуат",
    sub: "Энергия қаншалықты жылдам беріледі",
    intro: "Қуат — бір секундта берілетін энергия. Екі мотор бірдей жұмыс жасауы мүмкін, бірақ әртүрлі уақытта.",
    predict: {
      q: "Екі мотор бірдей жүкті бірдей биіктікке көтерді: біреуі 5 секундта, екіншісі 1 секундта. Қайсысы көбірек энергия берді (шығынсыз)?",
      opts: ["Баяу мотор", "Жылдам мотор", "Бірдей"],
      correct: 2,
      why: "Жүктің гравитациялық қорына екеуі де бірдей mgh энергия берді. Жылдам моторда энергия жылдамырақ берілді — оның қуаты көбірек.",
    },
    hint: "Оң жақ мотордың қуатын таңда, сосын «Көтеру» бас. Жүк массасы 10 кг, биіктік 5 м.",
    setup({ THREE: T, ink, flow, label, cam, ui, nf, COLORS: C }) {
      cam([0, 4.5, 12], [0, 2.4, 0]);
      const m = 10, H = 5, S = 0.64, E = m * G * H;
      const rig = (x, name) => {
        [-0.9, 0.9].forEach((dx) => { const p = ink(box(T, 0.15, 4.2, 0.15), "#d8c9a8"); p.position.set(x + dx, 2.1, 0); });
        const beam = ink(box(T, 2, 0.15, 0.3), "#d8c9a8"); beam.position.set(x, 4.25, 0);
        const motor = ink(new T.CylinderGeometry(0.3, 0.3, 0.6, 16), "#13a8c4"); motor.rotation.z = Math.PI / 2; motor.position.set(x, 4.65, 0);
        const rope = ink(new T.CylinderGeometry(0.02, 0.02, 1, 6), "#23212b", { edges: false });
        const load = ink(box(T, 0.8, 0.8, 0.8), "#f2a516");
        const tag = label(name, new T.Vector3(x, 5.35, 0), "#13a8c4", 0.8);
        return { x, motor, rope, load, tag, h: 0, t: 0, P: 0 };
      };
      const A = rig(-2.2, "A: 100 Вт"), B = rig(2.2, "B: 400 Вт");
      A.P = 100; B.P = 400;
      ui.bars([{ key: "a", label: "A жүгінің Eп", color: C.grav }, { key: "b", label: "B жүгінің Eп", color: C.grav }]);
      let running = false, acc = 0;
      const place = (r) => { r.load.position.set(r.x, 0.4 + r.h * S, 0); const len = 4.25 - (0.8 + r.h * S); r.rope.scale.y = Math.max(0.01, len); r.rope.position.set(r.x, 0.8 + r.h * S + len / 2, 0); };
      const reset = () => { [A, B].forEach((r) => { r.h = 0; r.t = 0; place(r); }); running = false; show(); };
      const show = () => {
        ui.setBars({ a: m * G * A.h, b: m * G * B.h }, E);
        const tt = (r) => `${nf(r.t, 1)} с / ${nf(E / r.P, 1)} с`;
        ui.readout(`Әр жүкке қажет энергия: mgh = <b>${nf(E, 0)} Дж</b><br>A (${A.P} Вт): <b>${tt(A)}</b> · B (${B.P} Вт): <b>${tt(B)}</b>`);
      };
      ui.chips([{ label: "B = 200 Вт", value: 200 }, { label: "B = 400 Вт", value: 400 }, { label: "B = 1000 Вт", value: 1000 }], 400, (x) => {
        B.P = x; world_relabel(); reset();
      });
      const world_relabel = () => { B.tag.visible = false; B.tag = label(`B: ${B.P} Вт`, new T.Vector3(B.x, 5.35, 0), "#13a8c4", 0.8); };
      ui.button("Көтеру", () => { reset(); running = true; });
      reset();
      return {
        update(dt) {
          if (!running) return;
          acc += dt;
          [A, B].forEach((r) => {
            if (r.h >= H) return;
            r.t += dt; r.h = Math.min(H, r.h + (r.P / (m * G)) * dt); place(r);
            r.motor.rotation.x += dt * r.P / 40;
            if (acc > 0.15) flow(r.motor.position.clone(), r.load.position.clone(), C.grav, 1, 0.5, 0.1);
          });
          if (acc > 0.15) acc = 0;
          if (A.h >= H && B.h >= H) running = false;
          show();
        },
      };
    },
    proof: `<div class="formula">P = E / t<small>P — қуат (Вт), E — берілген энергия (Дж), t — уақыт (с). 1 Вт = 1 Дж/с</small></div>
      <p><b>Мысал:</b> E = mgh = 10 × 9,8 × 5 = <b>490 Дж</b>. 100 Вт мотор: t = 490 / 100 = <b>4,9 с</b>. 400 Вт мотор: t = 490 / 400 ≈ <b>1,2 с</b>.</p>
      <p>Энергия бірдей, тек жеткізу жылдамдығы әртүрлі. Шайнектің, шаңсорғыштың, автокөліктің қуатын осылай салыстырамыз.</p>`,
  },

  // ───────────────────────── 7 ─────────────────────────
  {
    title: "Пайдалы әсер коэффициенті (ПӘК)",
    sub: "Энергияның қанша бөлігі пайдалы жұмысқа кетеді",
    intro: "Ешбір құрылғы кіріс энергиясының бәрін пайдалы жұмысқа айналдыра алмайды. Қалған бөлігі көбіне қоршаған ортаны жылытады.",
    predict: {
      q: "100 Дж электр энергиясының шамамен қаншасын қыздыру шамы жарыққа айналдырады?",
      opts: ["Шамамен 95 Дж", "Шамамен 50 Дж", "Шамамен 5 Дж"],
      correct: 2,
      why: "Қыздыру шамы энергияның шамамен 5%-ын ғана жарыққа айналдырады — қалғаны жылу. Сондықтан ол қолға ыстық. LED шамының ПӘК-і бірнеше есе жоғары.",
    },
    hint: "Құрылғыны таңда. Ағынды бақыла: көк — кіріс, сары — пайдалы, қызыл — шығын.",
    setup({ THREE: T, ink, flow, label, cam, ui, nf, COLORS: C }) {
      cam([0, 5.5, 12.5], [0, 1.4, 0]);
      const DEV = {
        bulb: { n: "Қыздыру шамы", eta: 0.05, use: "Жарық" },
        led: { n: "LED шамы", eta: 0.35, use: "Жарық" },
        kettle: { n: "Электр шәйнегі", eta: 0.9, use: "Судың жылулық қоры" },
        motor: { n: "Электр мотор", eta: 0.75, use: "Кинетикалық" },
      };
      const socket = ink(box(T, 0.8, 1, 0.5), "#13a8c4"); socket.position.set(-4.2, 0.5, 0);
      label("Кіріс: 100 Дж", new T.Vector3(-4.2, 1.6, 0), C.elec, 0.8);
      const lamp = ink(new T.SphereGeometry(0.7, 24, 16), "#fff6d6", { emissive: "#ffd34d", emissiveIntensity: 0.2 }); lamp.position.set(0, 1.4, 0);
      const base = ink(new T.CylinderGeometry(0.3, 0.35, 0.6, 16), "#8a8494"); base.position.set(0, 0.4, 0);
      const kettle = ink(new T.CylinderGeometry(0.6, 0.75, 1.3, 20), "#e8e4dc"); kettle.position.set(0, 0.65, 0);
      const motor = ink(new T.CylinderGeometry(0.55, 0.55, 1.2, 16), "#5aa7ff"); motor.rotation.z = Math.PI / 2; motor.position.set(0, 0.6, 0);
      const fan = ink(box(T, 0.08, 1.4, 0.2), "#23212b"); fan.position.set(0.7, 0.6, 0);
      const useLbl = { s: null }, useAt = new T.Vector3(4.2, 1.6, 0), wasteAt = new T.Vector3(2.4, 2.8, -2.4);
      label("Шығын: жылу", wasteAt.clone().add(new T.Vector3(0, 0.5, 0)), C.heat, 0.8);
      ui.bars([{ key: "in", label: "Кіріс энергия", color: C.elec }, { key: "use", label: "Пайдалы", color: C.light }, { key: "waste", label: "Шығын (жылу)", color: C.heat }]);
      let dev = "bulb", acc = 0, queue = [], time = 0;
      const set = (k) => {
        dev = k; const d = DEV[k];
        lamp.visible = base.visible = k === "bulb" || k === "led"; kettle.visible = k === "kettle"; motor.visible = fan.visible = k === "motor";
        lamp.material.emissiveIntensity = k === "led" ? 1.2 : 0.35;
        if (useLbl.s) useLbl.s.visible = false;
        useLbl.s = label("Пайдалы: " + d.use, useAt.clone().add(new T.Vector3(0, 0.5, 0)), "#b8860b", 0.8);
        ui.setBars({ in: 100, use: 100 * d.eta, waste: 100 * (1 - d.eta) }, 100);
        ui.readout(`${d.n}: ПӘК = ${nf(100 * d.eta, 0)} Дж / 100 Дж × 100% = <b>${nf(100 * d.eta, 0)}%</b>`);
      };
      ui.chips(Object.entries(DEV).map(([k, d]) => ({ label: d.n, value: k })), dev, set);
      set(dev);
      const mid = new T.Vector3(0, 1.2, 0);
      return {
        update(dt) {
          time += dt; acc += dt; fan.rotation.x += motor.visible ? dt * 8 : 0;
          if (acc > 0.07) {
            acc = 0;
            flow(new T.Vector3(-3.8, 0.8, 0), mid, C.elec, 1, 0.9, 0.5);
            queue.push(time + 0.9);
          }
          while (queue.length && queue[0] <= time) {
            queue.shift();
            if (Math.random() < DEV[dev].eta) flow(mid, useAt, C.light, 1, 0.9, 0.6);
            else flow(mid, wasteAt, C.heat, 1, 1.1, 0.4);
          }
        },
      };
    },
    proof: `<div class="formula">ПӘК = (пайдалы шығыс энергия / толық кіріс энергия) × 100%</div>
      <p><b>Мысал:</b> шамға 100 Дж берілді, 5 Дж жарыққа айналды → ПӘК = 5 / 100 × 100% = <b>5%</b>. Қалған 95 Дж бөлмені сәл жылытады.</p>
      <p>Энергияның сақталу заңы бойынша: кіріс = пайдалы + шығын. Сондықтан ПӘК әрқашан 100%-дан аз.</p>
      <p>ПӘК-ті арттыру жолдары: үйкелісті майлау арқылы азайту, жылу оқшаулау, тиімдірек технология (LED) таңдау.</p>
      <p class="note">ПӘК мәндері — шамамен алынған типтік мәндер.</p>`,
  },

  // ───────────────────────── 8 ─────────────────────────
  {
    title: "Электр станциялары және желі",
    sub: "Неге электр жоғары кернеумен тасымалданады",
    intro: "Электр станциясынан үйге дейін энергия сымдар арқылы жүздеген шақырымға жетеді. Сымдарда ол жылуға айналып, шығын болады.",
    predict: {
      q: "Неге электр энергиясы жоғары кернеумен тасымалданады?",
      opts: ["Электр тезірек жетуі үшін", "Ток азайып, сымдардағы шығын кемуі үшін", "Сымдар қауіпсіз болуы үшін"],
      correct: 1,
      why: "Бірдей қуатта P = VI, яғни кернеу жоғары болса, ток аз болады. Сымдағы шығын P = I²R токтың квадратына тәуелді — кернеуді 10 есе арттырсақ, шығын 100 есе азаяды.",
    },
    hint: "Тасымалдау кернеуін таңда. Станция 100 МВт береді, желінің кедергісі 10 Ом. Қызыл ұшқындар — сымдардағы жылу шығыны.",
    setup({ THREE: T, ink, flow, label, cam, world, ui, nf, COLORS: C }) {
      cam([0.5, 9, 18.5], [0.5, 1.6, 0]);
      const st = ink(box(T, 1.8, 1.4, 1.6), "#d8c9a8"); st.position.set(-7.2, 0.7, 0);
      const ch = ink(new T.CylinderGeometry(0.25, 0.35, 2.2, 12), "#c9c2b0"); ch.position.set(-6.8, 2.5, 0.3);
      label("Станция", new T.Vector3(-7.2, 3.9, 0), "#23212b", 0.8);
      const tr = (x, txt) => {
        const b = ink(box(T, 0.9, 0.9, 0.9), "#8a8494"); b.position.set(x, 0.45, 0);
        [-0.2, 0.2].forEach((dz) => { const c = ink(new T.CylinderGeometry(0.15, 0.15, 0.5, 12), "#b5653a"); c.position.set(x, 1.15, dz); });
        label(txt, new T.Vector3(x, 2, 0), "#23212b", 0.7);
      };
      tr(-4.9, "↑ Трансформатор"); tr(5.9, "↓ Трансформатор");
      const pyl = [-2.6, 0.5, 3.5];
      pyl.forEach((x) => {
        const leg = ink(new T.CylinderGeometry(0.06, 0.4, 3, 4), "#c9c2b0"); leg.position.set(x, 1.5, 0);
        const arm = ink(box(T, 1.6, 0.08, 0.08), "#c9c2b0"); arm.position.set(x, 2.9, 0);
      });
      const pts = []; const xs = [-4.9, ...pyl, 5.9];
      for (let i = 0; i < xs.length - 1; i++) for (let k = 0; k <= 10; k++) {
        const x = xs[i] + (xs[i + 1] - xs[i]) * (k / 10), end = i === 0 || i === xs.length - 2;
        pts.push(new T.Vector3(x, 2.9 - Math.sin((k / 10) * Math.PI) * 0.35 - (end ? 0 : 0), 0));
      }
      pts[0].y = 1.4; pts[pts.length - 1].y = 1.4;
      world.add(new T.Line(new T.BufferGeometry().setFromPoints(pts), new T.LineBasicMaterial({ color: 0x23212b })));
      const house = ink(box(T, 1.4, 1.1, 1.2), "#f4f0e6"); house.position.set(8, 0.55, 0);
      const roof = ink(new T.ConeGeometry(1.1, 0.8, 4), "#e5484d"); roof.rotation.y = Math.PI / 4; roof.position.set(8, 1.5, 0);
      const win = ink(box(T, 0.4, 0.35, 0.02), "#fff3b0", { emissive: "#ffd34d", emissiveIntensity: 1 }); win.position.set(8, 0.6, 0.61);
      label("Үй", new T.Vector3(8, 2.4, 0), "#23212b", 0.8);
      ui.bars([{ key: "p", label: "Станция берді", color: C.elec }, { key: "loss", label: "Сымдарда жылуға", color: C.heat }, { key: "out", label: "Тұтынушыға жетті", color: C.elas }]);
      const P = 100e6, R = 10;
      let V = 110e3, loss = 0, acc = 0;
      const set = (v) => {
        V = v; const I = P / V; const L = Math.min(P, I * I * R); loss = L / P;
        win.material.emissiveIntensity = 0.2 + 1.2 * (1 - loss);
        ui.setBars({ p: P, loss: L, out: P - L }, P, (x) => nf(x / 1e6, 1) + " МВт");
        ui.readout(`I = P / V = <b>${nf(I, 0)} А</b><br>P<sub>шығын</sub> = I²R = <b>${nf(L / 1e6, 1)} МВт</b> (${nf(loss * 100, 1)}%)`);
      };
      ui.chips([35e3, 110e3, 220e3, 500e3].map((v) => ({ label: v / 1e3 + " кВ", value: v })), V, set);
      set(V);
      return {
        update(dt) {
          acc += dt;
          if (acc < 0.06) return; acc = 0;
          flow(new T.Vector3(-6.4, 0.8, 0), new T.Vector3(-4.9, 1.2, 0), C.elec, 1, 0.5, 0.3);
          if (Math.random() < loss) {
            const x = -4 + Math.random() * 9.4, p = new T.Vector3(x, 2.7, 0);
            flow(p, p.clone().add(new T.Vector3((Math.random() - 0.5), 1.2, 0)), C.heat, 1, 0.9, 0.2);
          } else flow(new T.Vector3(-4.9, 1.4, 0), new T.Vector3(5.9, 1.4, 0), C.elec, 1, 1.6, 1.4);
        },
      };
    },
    proof: `<div class="formula">P = V · I &nbsp;&nbsp; P<sub>шығын</sub> = I² · R</div>
      <p>100 МВт қуатты 10 Ом кедергілі желімен жеткізсек:</p>
      <table style="width:100%;font:500 15px Inter,sans-serif;border-collapse:collapse"><tr><th align="left">Кернеу</th><th align="left">Ток</th><th align="left">Шығын</th></tr>
      <tr><td>35 кВ</td><td>≈ 2 857 А</td><td>≈ 82%</td></tr><tr><td>110 кВ</td><td>≈ 909 А</td><td>≈ 8%</td></tr><tr><td>500 кВ</td><td>200 А</td><td>0,4%</td></tr></table>
      <p>Жоғарылатқыш трансформатор кернеуді көтереді, төмендеткіш трансформатор оны тұрмыстық 220 В-қа дейін түсіреді.</p>
      <p>Қазақстанда электрдің басым бөлігі көмірден өндіріледі, ал жаңартылатын көздердің (жел, күн, шағын ГЭС) үлесі 2024 жылы шамамен 6,4% болды.</p>`,
  },

  // ───────────────────────── 9 ─────────────────────────
  {
    title: "Тамақтағы энергия",
    sub: "Химиялық қордан — қозғалысқа",
    intro: "Тамақтағы энергия химиялық қорда сақталады. Дене оны бұлшықеттің жұмысына және жылуға айналдырады.",
    predict: {
      q: "100 г алмадағы энергия (≈ 220 кДж) 50 кг адамды қанша биіктікке көтере алады? Бұлшықеттің ПӘК-і ≈ 25%.",
      opts: ["≈ 1 м", "≈ 10 м", "≈ 100 м", "≈ 1 км"],
      correct: 2,
      why: "h = ПӘК × E / (mg) = 0,25 × 218 000 / (50 × 9,8) ≈ 111 м — шамамен 37 қабатты үй. Энергияның қалған 75%-ы денені жылытады.",
    },
    hint: "Тағамды және мөлшерін таңда, сосын «Энергияны жұмсау» бас. Адамның массасы 50 кг, бір қабат 3 м.",
    setup({ THREE: T, ink, flow, label, cam, world, ui, nf, COLORS: C }) {
      cam([7, 6, 11], [0, 3, 0]);
      const FOOD = {
        apple: { n: "Алма", kj: 218 }, banana: { n: "Банан", kj: 371 }, milk: { n: "Сүт", kj: 250 },
        bread: { n: "Нан", kj: 1100 }, choco: { n: "Шоколад", kj: 2240 },
      };
      const plate = ink(new T.CylinderGeometry(1.1, 0.9, 0.12, 32), "#f4f0e6"); plate.position.set(-3, 0.06, 1);
      const shapes = {
        apple: ink(new T.SphereGeometry(0.55, 20, 14), "#e5484d"), banana: ink(new T.CapsuleGeometry(0.22, 1.1, 6, 12), "#f5c518"),
        milk: ink(new T.CylinderGeometry(0.4, 0.35, 1.1, 20), "#ffffff"), bread: ink(box(T, 1.2, 0.6, 0.7), "#d9a066"), choco: ink(box(T, 1.1, 0.15, 0.6), "#6b3e26"),
      };
      shapes.banana.rotation.z = Math.PI / 2;
      const person = ink(new T.CapsuleGeometry(0.16, 0.4, 6, 10), "#2f8cff");
      const tower = new T.Group(); world.add(tower);
      const FH = 0.16, MAXF = 60, M = 50, ETA = 0.25;
      let food = "apple", g = 100, floors = 0, p = 0, running = false, acc = 0, extra = null;
      const calc = () => { const E = FOOD[food].kj * 1000 * (g / 100); const h = (ETA * E) / (M * G); return { E, h, f: h / 3 }; };
      const build = () => {
        while (tower.children.length) { const o = tower.children.pop(); o.geometry.dispose(); }
        const { f } = calc(); floors = f;
        for (let i = 0; i < Math.min(MAXF, Math.ceil(f)); i++) {
          const s = ink(box(T, 1.4, FH * 0.8, 1.4), i % 2 ? "#e9dfc8" : "#d8c9a8", { edges: i % 5 === 0 }); s.position.set(1.5, FH * i + FH * 0.4, 0); tower.add(s);
        }
        if (extra) extra.visible = false;
        extra = f > MAXF ? label(`+${nf(f - MAXF, 0)} қабат жоғары`, new T.Vector3(1.5, MAXF * FH + 0.6, 0), C.grav, 0.8) : null;
      };
      const reset = () => {
        p = 0; running = false;
        Object.entries(shapes).forEach(([k, s]) => { s.visible = k === food; s.scale.setScalar(1); s.position.set(-3, 0.6, 1); });
        build(); place(); show();
      };
      const place = () => { const lvl = Math.min(floors, MAXF) * p; person.position.set(2.5, lvl * FH + 0.36, 0.9); };
      const show = () => {
        const { E, h, f } = calc();
        ui.setBars({ chem: E * (1 - p), grav: ETA * E * p, heat: (1 - ETA) * E * p }, E, (x) => nf(x / 1000, 0) + " кДж");
        ui.readout(`${FOOD[food].n}, ${g} г: E ≈ <b>${nf(E / 1000, 0)} кДж</b><br>h = ПӘК·E/(mg) ≈ <b>${nf(h, 0)} м</b> ≈ <b>${nf(f, 0)} қабат</b>`);
      };
      ui.bars([{ key: "chem", label: "Тамақтағы химиялық", color: C.chem }, { key: "grav", label: "Гравитациялық", color: C.grav }, { key: "heat", label: "Дене жылуы", color: C.heat }]);
      ui.chips(Object.entries(FOOD).map(([k, o]) => ({ label: o.n, value: k })), food, (x) => { food = x; reset(); });
      ui.slider({ label: "Мөлшері", min: 10, max: 200, step: 10, value: g, fmt: (x) => x + " г", on: (x) => { g = x; reset(); } });
      ui.button("Энергияны жұмсау", () => { reset(); running = true; });
      reset();
      cam([7, 6, 11], [0.5, 3, 0]);
      return {
        update(dt) {
          if (!running) return;
          p = Math.min(1, p + dt / 3.5); acc += dt;
          shapes[food].scale.setScalar(Math.max(0.05, 1 - p));
          if (acc > 0.12) {
            acc = 0;
            flow(shapes[food].position.clone(), person.position.clone(), C.chem, 1, 0.7, 0.8);
            if (Math.random() < 0.75) flow(person.position.clone(), person.position.clone().add(new T.Vector3(1.2, 0.8, 0.5)), C.heat, 1, 0.8, 0.2);
          }
          place(); show();
          if (p >= 1) running = false;
        },
      };
    },
    proof: `<p>Тамақтың энергиясы химиялық қорда. Бұлшықет оның шамамен 25%-ын механикалық жұмысқа айналдырады, қалғаны — жылу:</p>
      <div class="formula">h = ПӘК × E / (m · g)</div>
      <p><b>Мысал:</b> 100 г алма ≈ 218 кДж. h = 0,25 × 218 000 / (50 × 9,8) ≈ <b>111 м</b> ≈ 37 қабат.</p>
      <p>Тағам орамындағы «кДж» жазуы — сол тағамның химиялық қорындағы энергия. 1 ккал ≈ 4,2 кДж.</p>
      <p class="note">Тағам мәндері 100 г-ға шамамен алынған; нақты мәнді орамнан қара. Бұл — физика тәжірибесі, тамақтану бойынша кеңес емес.</p>`,
  },

  // ───────────────────────── 10 ─────────────────────────
  {
    title: "Энергияның сақталу заңы",
    sub: "Әр джоуль есепте: энергия жоғалмайды",
    intro: "Энергия жоқтан пайда болмайды және жойылмайды. Ол тек бір қордан екіншісіне ауысады. Маятник — мұның ең әдемі дәлелі.",
    predict: {
      q: "Үйкеліс мүлдем болмаса, маятник бастапқы биіктігінен жоғары көтеріле ала ма?",
      opts: ["Иә, екпінімен жоғары көтеріледі", "Жоқ, дәл сол биіктікке дейін көтеріледі", "Жоқ, әр тербелісте төмендей береді"],
      correct: 1,
      why: "Үйкеліссіз жалпы энергия mgh₀-ге тең. Жоғары көтерілу үшін қосымша энергия керек — ол жоқтан пайда болмайды. Үйкеліс болса ғана маятник бірте-бірте төмендейді.",
    },
    hint: "Бастапқы бұрышты таңда, «Жіберу» бас. Үйкелісті қосып, «Жалпы энергия» бағанасының өзгермейтінін бақыла.",
    setup({ THREE: T, ink, flow, cam, world, ui, nf, COLORS: C }) {
      cam([0, 3, 10], [0, 2.4, 0]);
      const Lm = 2, S = 1.6, PY = 4.6, m = 1;
      [-2.6, 2.6].forEach((x) => { const p = ink(box(T, 0.15, PY, 0.15), "#d8c9a8"); p.position.set(x, PY / 2, 0); });
      const beam = ink(box(T, 5.4, 0.15, 0.2), "#d8c9a8"); beam.position.set(0, PY, 0);
      const bob = ink(new T.IcosahedronGeometry(0.3, 2), "#ff9f5a");
      const strGeo = new T.BufferGeometry().setFromPoints([new T.Vector3(0, PY, 0), new T.Vector3(0, 0, 0)]);
      world.add(new T.Line(strGeo, new T.LineBasicMaterial({ color: 0x23212b })));
      const ref = ink(box(T, 5.2, 0.025, 0.025), "#ff7a1a", { edges: false });
      ui.bars([{ key: "ep", label: "Гравитациялық Eп", color: C.grav }, { key: "ek", label: "Кинетикалық Eк", color: C.kin }, { key: "heat", label: "Жылу (үйкеліс)", color: C.heat }, { key: "tot", label: "Жалпы энергия", color: C.total }]);
      let a0 = 45, th, w, fric = false, running = false, E0, peak, last = 0, acc = 0;
      const lowY = PY - Lm * S;
      const reset = () => {
        th = (a0 * Math.PI) / 180; w = 0; running = false; E0 = m * G * Lm * (1 - Math.cos(th)); peak = 0;
        ref.position.set(0, lowY + Lm * S * (1 - Math.cos(th)) - 0.3, 0.05); draw();
      };
      const draw = () => {
        const x = Math.sin(th) * Lm * S, y = PY - Math.cos(th) * Lm * S;
        bob.position.set(x, y - 0, 0);
        const pos = strGeo.attributes.position; pos.setXYZ(1, x, y, 0); pos.needsUpdate = true;
        const hh = Lm * (1 - Math.cos(th)), ep = m * G * hh, ek = 0.5 * m * (Lm * w) ** 2, heat = Math.max(0, E0 - ep - ek);
        ui.setBars({ ep, ek, heat, tot: ep + ek + heat }, E0, (v) => nf(v, 2) + " Дж");
        ui.readout(`Eп + Eк + Eжылу = <b>${nf(ep + ek + heat, 2)} Дж</b> — тұрақты<br>Бастапқы биіктік: <b>${nf(Lm * (1 - Math.cos((a0 * Math.PI) / 180)) * 100, 0)} см</b> · соңғы ең биік нүкте: <b>${nf(peak * 100, 0)} см</b>`);
      };
      ui.slider({ label: "Бастапқы бұрыш", min: 10, max: 80, step: 5, value: a0, fmt: (x) => x + "°", on: (x) => { a0 = x; reset(); } });
      ui.chips([{ label: "Үйкеліссіз", value: false }, { label: "Үйкеліспен", value: true }], fric, (x) => { fric = x; reset(); });
      ui.button("Жіберу", () => { reset(); running = true; });
      reset();
      return {
        update(dt) {
          if (!running) return;
          const b = fric ? 0.35 : 0;
          for (let i = 0; i < 6; i++) { const d = dt / 6; w += (-(G / Lm) * Math.sin(th) - b * w) * d; th += w * d; }
          if (Math.sign(w) !== Math.sign(last) && last !== 0) { peak = Lm * (1 - Math.cos(th)); }
          last = w; acc += dt;
          if (fric && acc > 0.25 && Math.abs(w) > 0.3) { acc = 0; flow(bob.position.clone(), bob.position.clone().add(new T.Vector3(0, 1, 0.6)), C.heat, 1, 0.8, 0.2); }
          draw();
        },
      };
    },
    proof: `<div class="formula">E<sub>жалпы</sub> = Eп + Eк + Eжылу = const</div>
      <p>Үйкеліссіз: ең жоғарғы нүктеде барлық энергия гравитациялық қорда, ең төменгі нүктеде — кинетикалық қорда. Маятник дәл бастапқы биіктігіне оралады.</p>
      <p>Үйкеліспен: әр тербелісте энергияның бір бөлігі жылуға ауысып, ауаға тарайды. Маятник тоқтайды, бірақ жалпы энергия өзгермейді.</p>
      <p><b>Кітаптың басты ойы:</b> энергия жоғалмайды — ол тек ауысады. Әр джоуль есепте.</p>`,
  },
];
