/*
 * Revestor DSCR widget (PRIVATE DEMO).
 * Usage on a listing page:
 *   <div data-revestor-widget data-address="..." data-city="..." data-state="CA" data-zip="93706"
 *        data-price="349000" data-beds="3" data-baths="2" data-sqft="1420"
 *        data-tax-annual="3900" data-hoa-monthly="0"></div>
 *   <script src="https://<revestor host>/revestor-widget.js" defer></script>
 * It reads only the data-* values the page gives it. It does not read or copy anything else from the page.
 * Host pages can listen for "revestor:quote" and "revestor:lead" events on the element for their own analytics.
 */
(function () {
  var script = document.currentScript;
  var origin = script ? new URL(script.src).origin : location.origin;
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var money = function (n) { return (n < 0 ? "-$" : "$") + Math.abs(Math.round(n)).toLocaleString("en-US"); };
  var pct = function (n) { var v = n * 100; return (Math.abs(v - Math.round(v)) < 0.05 ? Math.round(v) : v.toFixed(1)) + "%"; };
  // Round down below 1.0 so a ratio that misses the mark never displays as 1.00.
  var fx = function (d) { return (d < 1 ? Math.floor(d * 100 + 1e-9) / 100 : d).toFixed(2); };
  var MIN = 0.5, MAX = 1.5, ARC = Math.PI * 80;
  var pos = function (d) { return Math.min(1, Math.max(0, (d - MIN) / (MAX - MIN))); };

  // Fonts must be declared on the document: @font-face inside a shadow root is ignored.
  function fonts() {
    if (document.getElementById("revestor-widget-fonts")) return;
    var s = document.createElement("style");
    s.id = "revestor-widget-fonts";
    var f = function (name, file, weight) {
      return "@font-face{font-family:'" + name + "';src:url(" + origin + "/widget-fonts/" + file + ") format('woff2');font-weight:" + weight + ";font-display:swap}";
    };
    s.textContent = f("Revestor Serif", "newsreader.woff2", "200 800") + f("Revestor Sans", "jakarta.woff2", "200 800") + f("Revestor Mono", "plex-mono-500.woff2", "500");
    document.head.append(s);
  }

  var CSS = [
    ":host{all:initial;display:block;container-type:inline-size;--ink:#10213a;--muted:#516175;--line:#dce4ed;--paper:#f5f8fc;--blue:#061b57;--blue-h:#03113b;--lime:#a5cf00;--green:#356b24;--amber:#8a5a00;--red:#ba0b0b;--ease:cubic-bezier(.22,1,.36,1);",
    "font:14px/1.5 'Revestor Sans',system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;color:var(--ink);-webkit-font-smoothing:antialiased}",
    "*{box-sizing:border-box}[hidden]{display:none!important}",
    ".card{background:#fff;border:1px solid var(--line);border-radius:24px;overflow:hidden;max-width:440px;box-shadow:0 1px 2px #10213a0a,0 12px 32px #10213a0f}",
    ".head{background:var(--blue);color:#fff;padding:14px 20px;display:flex;align-items:center;justify-content:space-between;gap:12px}",
    ".brand{font:500 19px/1 'Revestor Serif',Georgia,serif;letter-spacing:-.03em}.brand i{font-style:normal;color:var(--lime)}",
    ".by{font:500 10px/1.2 'Revestor Mono',ui-monospace,monospace;letter-spacing:.06em;text-transform:uppercase;opacity:.72;text-align:right}",
    ".body{padding:20px}",
    ".gauge{position:relative;width:100%;max-width:300px;margin:0 auto}.gauge svg{display:block;width:100%;height:auto;overflow:visible}",
    ".track{stroke:#e8eef5}.band{stroke:#061b5726}.fill{stroke:var(--amber);transition:stroke-dashoffset .7s var(--ease),stroke .3s}.fill.good{stroke:var(--green)}",
    ".read{position:absolute;left:0;right:0;bottom:0;text-align:center}",
    ".num{font:500 52px/1 'Revestor Serif',Georgia,serif;letter-spacing:-.04em;font-variant-numeric:tabular-nums}",
    ".unit{font:500 10px/1 'Revestor Mono',ui-monospace,monospace;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-top:6px}",
    ".scale{display:flex;justify-content:space-between;max-width:300px;margin:4px auto 0;font:500 10px/1 'Revestor Mono',ui-monospace,monospace;color:var(--muted)}",
    ".verdict{display:flex;gap:10px;align-items:flex-start;margin:16px 0 0;padding:12px 14px;border-radius:14px;background:var(--paper);font-size:14px;line-height:1.45}",
    ".dot{flex:none;width:9px;height:9px;border-radius:50%;margin-top:6px;background:var(--amber)}.dot.good{background:var(--green)}",
    ".verdict b{font-weight:650}.sub{display:block;color:var(--muted);font-size:12px;margin-top:2px}",
    ".label{display:flex;justify-content:space-between;align-items:baseline;font-size:12px;font-weight:600;margin:20px 0 8px}.label span:last-child{font:500 13px/1 'Revestor Mono',ui-monospace,monospace;font-variant-numeric:tabular-nums}",
    "input[type=range]{-webkit-appearance:none;appearance:none;width:100%;height:28px;margin:0;background:none;cursor:pointer}",
    "input[type=range]::-webkit-slider-runnable-track{height:6px;border-radius:99px;background:linear-gradient(to right,var(--blue) var(--p,0%),#e8eef5 var(--p,0%))}",
    "input[type=range]::-moz-range-track{height:6px;border-radius:99px;background:#e8eef5}input[type=range]::-moz-range-progress{height:6px;border-radius:99px;background:var(--blue)}",
    "input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:22px;height:22px;margin-top:-8px;border-radius:50%;background:#fff;border:2px solid var(--blue);box-shadow:0 2px 6px #10213a33}",
    "input[type=range]::-moz-range-thumb{width:18px;height:18px;border-radius:50%;background:#fff;border:2px solid var(--blue);box-shadow:0 2px 6px #10213a33}",
    ".reach{margin-top:4px;font-size:12px;font-weight:600;color:var(--blue);background:none;border:0;padding:6px 0;cursor:pointer;text-decoration:underline;text-underline-offset:3px;font-family:inherit}",
    ".seg{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;padding:4px;background:var(--paper);border-radius:16px}",
    ".seg button{font:inherit;border:0;background:none;border-radius:12px;padding:8px 4px;cursor:pointer;color:var(--muted);display:grid;gap:2px;transition:background .2s,color .2s,box-shadow .2s}",
    ".seg button b{font-size:12px;font-weight:600}.seg button span{font:500 13px/1.2 'Revestor Mono',ui-monospace,monospace;font-variant-numeric:tabular-nums}",
    ".seg button[aria-checked=true]{background:#fff;color:var(--ink);box-shadow:0 1px 2px #10213a14,0 4px 12px #10213a14}.seg button:hover{color:var(--ink)}",
    ".stats{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--line);border:1px solid var(--line);border-radius:14px;overflow:hidden;margin-top:20px}",
    ".stats div{background:#fff;padding:10px 12px}.stats dt{font-size:11px;color:var(--muted)}.stats dd{margin:2px 0 0;font:500 15px/1.2 'Revestor Mono',ui-monospace,monospace;font-variant-numeric:tabular-nums}",
    ".neg{color:var(--red)}.pos{color:var(--green)}",
    "details{margin-top:14px;border-top:1px solid var(--line)}summary{cursor:pointer;list-style:none;padding:12px 0 4px;font-size:12px;font-weight:600;color:var(--muted);display:flex;justify-content:space-between}",
    "summary::-webkit-details-marker{display:none}summary::after{content:'+';font:500 15px/1 'Revestor Mono',monospace}details[open] summary::after{content:'\\2212'}",
    "table{width:100%;border-collapse:collapse;font-size:13px}td{padding:4px 0}td:last-child{text-align:right;font:500 13px/1.3 'Revestor Mono',ui-monospace,monospace;font-variant-numeric:tabular-nums}",
    "td small{color:var(--muted);font-size:11px}tr.total td{border-top:1px solid var(--line);font-weight:650;padding-top:8px}",
    ".cta{margin-top:18px;width:100%;min-height:48px;border:0;border-radius:14px;background:var(--blue);color:#fff;font:600 15px/1 inherit;font-family:inherit;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:background .2s,transform .2s var(--ease)}",
    ".cta:hover{background:var(--blue-h)}.cta:active{transform:scale(.985)}.cta:disabled{opacity:.5;cursor:not-allowed}.cta em{font-style:normal;color:var(--lime);transition:transform .25s var(--ease)}.cta:hover em{transform:translateX(3px)}",
    ".ghost{margin-top:8px;width:100%;min-height:40px;border:0;background:none;color:var(--muted);font:inherit;cursor:pointer;border-radius:12px}.ghost:hover{color:var(--ink);background:var(--paper)}",
    ".fine{font-size:10.5px;line-height:1.5;color:var(--muted);margin:14px 0 0}",
    "form{display:grid;gap:12px;margin-top:4px}.f label{display:block;font-size:12px;font-weight:600;margin-bottom:4px}",
    ".f input{width:100%;min-height:44px;padding:0 12px;border:1px solid #c3cfdc;border-radius:12px;font:inherit;color:var(--ink);background:#fff;transition:border-color .15s,box-shadow .15s}",
    ".f input[aria-invalid=true]{border-color:var(--red)}.f small{display:block;color:var(--red);font-size:11.5px;margin-top:3px;min-height:0}",
    ".consent{display:flex;gap:10px;align-items:flex-start;font-size:11px;line-height:1.45;color:var(--muted)}.consent input{flex:none;width:18px;height:18px;margin:1px 0 0;accent-color:var(--blue)}",
    ".hp{position:absolute!important;left:-9999px;width:1px;height:1px;opacity:0}",
    ".recap{padding:12px 14px;border-radius:14px;background:var(--paper);font-size:13px}.recap b{display:block;font-weight:650}.recap span{color:var(--muted);font-size:12px}",
    ".err{color:var(--red);font-size:13px;margin:0}",
    ".done{text-align:center;padding:12px 0 4px}.tick{width:56px;height:56px;border-radius:50%;background:var(--lime);display:grid;place-items:center;margin:0 auto 14px}.tick svg{width:26px;height:26px}",
    ".done h3{font:500 24px/1.15 'Revestor Serif',Georgia,serif;letter-spacing:-.03em;margin:0 0 6px}.done p{color:var(--muted);margin:0 0 4px;font-size:13.5px}",
    ".sk{border-radius:10px;background:linear-gradient(90deg,#eef2f7 25%,#f7f9fc 50%,#eef2f7 75%);background-size:200% 100%;animation:sh 1.2s linear infinite}@keyframes sh{to{background-position:-200% 0}}",
    ".busy .num,.busy .stats dd,.busy td:last-child{opacity:.45;transition:opacity .15s}",
    ":focus-visible{outline:2px solid var(--blue);outline-offset:2px}.head :focus-visible{outline-color:var(--lime)}",
    "@container (max-width:340px){.body{padding:16px}.num{font-size:44px}.stats{grid-template-columns:1fr 1fr}.stats div:last-child{grid-column:1/-1}.by{display:none}.seg button b{font-size:11px;white-space:nowrap}.seg{gap:2px}}",
    "@media (prefers-reduced-motion:reduce){*{transition:none!important;animation:none!important}}",
  ].join("");

  function el(tag, props, kids) {
    var n = document.createElement(tag), k;
    for (k in props || {}) {
      if (k === "attrs") for (var a in props.attrs) n.setAttribute(a, props.attrs[a]);
      else n[k] = props[k];
    }
    (kids || []).forEach(function (c) { if (c != null) n.append(c); });
    return n;
  }
  function svg(tag, attrs) {
    var n = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (var a in attrs) n.setAttribute(a, attrs[a]);
    return n;
  }

  function mount(host) {
    var d = host.dataset;
    var st = { downPct: 0.2, term: "30", quote: null, shown: null, seq: 0, ctrl: null, timer: 0, raf: 0 };
    var root = host.attachShadow({ mode: "open" });
    var card = el("section", { className: "card", attrs: { "aria-label": "Revestor investor financing estimate" } });
    root.append(el("style", { textContent: CSS }), card);
    card.append(el("header", { className: "head" }, [
      el("div", { className: "brand" }, ["RE", el("i", { textContent: "vestor" })]),
      el("div", { className: "by", textContent: "Powered by Griffin Funding" }),
    ]));
    var body = el("div", { className: "body" });
    card.append(body);

    /* ---------- quote view (built once, updated in place so the slider keeps focus) ---------- */
    var arc = "M20 100 A80 80 0 0 1 180 100";
    var g = svg("svg", { viewBox: "0 0 200 112", role: "img" });
    var track = svg("path", { d: arc, fill: "none", "stroke-width": 14, "stroke-linecap": "round", class: "track" });
    var band = svg("path", { d: arc, fill: "none", "stroke-width": 14, class: "band" });
    var fill = svg("path", { d: arc, fill: "none", "stroke-width": 14, "stroke-linecap": "round", class: "fill", "stroke-dasharray": ARC, "stroke-dashoffset": ARC });
    var tick = svg("path", { d: "M100 8 V32", stroke: "#10213a", "stroke-width": 2, "stroke-linecap": "round" });
    var tickT = svg("text", { x: 100, y: 3, "text-anchor": "middle", "font-size": 8, fill: "#516175", "font-family": "'Revestor Mono',monospace" });
    tickT.textContent = "1.0";
    g.append(track, band, fill, tick, tickT);
    var num = el("div", { className: "num", textContent: "–" });
    var gauge = el("div", { className: "gauge" }, [g, el("div", { className: "read" }, [num, el("div", { className: "unit", textContent: "DSCR" })])]);
    var scale = el("div", { className: "scale", attrs: { "aria-hidden": "true" } }, [el("span", { textContent: "0.5" }), el("span", { textContent: "1.5+" })]);
    var dot = el("span", { className: "dot" });
    var vMain = el("b"), vSub = el("span", { className: "sub" });
    var verdict = el("div", { className: "verdict", attrs: { role: "status", "aria-live": "polite" } }, [dot, el("div", {}, [vMain, vSub])]);

    var downVal = el("span");
    var slider = el("input", { type: "range", min: "20", max: "50", step: "1", value: "20", attrs: { "aria-label": "Down payment percent" } });
    var reach = el("button", { type: "button", className: "reach", hidden: true });
    var seg = el("div", { className: "seg", attrs: { role: "radiogroup", "aria-label": "Loan type" } });
    var segBtn = {};
    [["30", "30-year"], ["40", "40-year"], ["io", "Interest-only"]].forEach(function (t) {
      var v = el("span", { textContent: "–" });
      var b = el("button", { type: "button", attrs: { role: "radio", "aria-checked": String(t[0] === st.term) } }, [el("b", { textContent: t[1] }), v]);
      b.onclick = function () { setTerm(t[0]); };
      segBtn[t[0]] = { b: b, v: v };
      seg.append(b);
    });
    seg.onkeydown = function (e) {
      var order = ["30", "40", "io"], i = order.indexOf(st.term);
      if (e.key === "ArrowRight" || e.key === "ArrowDown") i = (i + 1) % 3;
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") i = (i + 2) % 3;
      else return;
      e.preventDefault();
      setTerm(order[i]);
      segBtn[order[i]].b.focus();
    };

    var sRent = el("dd"), sPay = el("dd"), sFlow = el("dd");
    var stats = el("dl", { className: "stats" }, [
      el("div", {}, [el("dt", { textContent: "Est. rent" }), sRent]),
      el("div", {}, [el("dt", { textContent: "Payment" }), sPay]),
      el("div", {}, [el("dt", { textContent: "Cash flow" }), sFlow]),
    ]);
    var tbody = el("tbody");
    var details = el("details", {}, [el("summary", { textContent: "How this is calculated" }), el("table", {}, [tbody])]);
    var cta = el("button", { type: "button", className: "cta" }, ["Check my loan options ", el("em", { textContent: "→" })]);
    cta.onclick = function () { showForm(); };
    var fine = el("p", { className: "fine", textContent:
      "Estimate only, provided by Griffin Funding. Not a loan offer, approval or commitment to lend. Rent, rate, taxes and insurance are estimates and will differ. Demo: rent and rate are sample values." });
    var quoteView = el("div", {}, [
      gauge, scale, verdict,
      el("div", { className: "label" }, [el("span", { textContent: "Down payment" }), downVal]), slider, reach,
      el("div", { className: "label" }, [el("span", { textContent: "Loan type" }), el("span", { textContent: "DSCR" })]), seg,
      stats, details, cta, fine,
    ]);
    var skeleton = el("div", { attrs: { "aria-busy": "true", "aria-label": "Loading estimate" } }, [
      el("div", { className: "sk", style: "height:150px;max-width:300px;margin:0 auto" }),
      el("div", { className: "sk", style: "height:56px;margin-top:16px" }),
      el("div", { className: "sk", style: "height:28px;margin-top:24px" }),
      el("div", { className: "sk", style: "height:60px;margin-top:20px" }),
      el("div", { className: "sk", style: "height:48px;margin-top:20px" }),
    ]);
    var errView = el("div", { hidden: true });
    var formView = el("div", { hidden: true });
    var doneView = el("div", { hidden: true });
    quoteView.hidden = true;
    body.append(skeleton, quoteView, errView, formView, doneView);

    function show(v) {
      [skeleton, quoteView, errView, formView, doneView].forEach(function (x) { x.hidden = x !== v; });
    }

    function setSlider() {
      slider.value = String(Math.round(st.downPct * 100));
      slider.style.setProperty("--p", ((st.downPct - 0.2) / 0.3) * 100 + "%");
      downVal.textContent = pct(st.downPct) + " · " + money(Number(d.price) * st.downPct);
    }
    slider.oninput = function () {
      st.downPct = Number(slider.value) / 100;
      setSlider();
      clearTimeout(st.timer);
      st.timer = setTimeout(load, 140);
    };
    function setTerm(t) {
      if (t === st.term) return;
      st.term = t;
      for (var k in segBtn) segBtn[k].b.setAttribute("aria-checked", String(k === t));
      for (var k2 in segBtn) segBtn[k2].b.tabIndex = k2 === t ? 0 : -1;
      load();
    }
    for (var k0 in segBtn) segBtn[k0].b.tabIndex = k0 === st.term ? 0 : -1;

    function tween(to) {
      cancelAnimationFrame(st.raf);
      var from = st.shown == null ? to : st.shown, t0 = performance.now();
      if (reduce || from === to) { st.shown = to; num.textContent = fx(to); return; }
      (function step(now) {
        var k = Math.min(1, (now - t0) / 550), e = 1 - Math.pow(1 - k, 3);
        st.shown = from + (to - from) * e;
        num.textContent = fx(st.shown);
        if (k < 1) st.raf = requestAnimationFrame(step);
      })(t0);
    }

    function paint(q) {
      var good = q.dscr >= 1;
      tween(q.dscr);
      fill.setAttribute("stroke-dashoffset", ARC * (1 - pos(q.dscr)));
      fill.setAttribute("class", "fill" + (good ? " good" : ""));
      if (q.dscrLow && q.dscrHigh) {
        var a = pos(q.dscrLow) * ARC, b = pos(q.dscrHigh) * ARC;
        band.setAttribute("stroke-dasharray", "0 " + a + " " + Math.max(0, b - a) + " " + ARC);
        g.setAttribute("aria-label", "DSCR " + fx(q.dscr) + ", range " + fx(q.dscrLow) + " to " + fx(q.dscrHigh));
      }
      dot.className = "dot" + (good ? " good" : "");
      vMain.textContent = good
        ? "Estimated rent covers the payment at " + pct(q.downPct) + " down."
        : q.need.reachable
          ? "Reaches 1.0 at about " + pct(q.need.downPct) + " down."
          : "Does not reach 1.0 within 50% down on this loan type.";
      vSub.textContent = q.dscrLow && q.dscrHigh
        ? "Likely range " + fx(q.dscrLow) + " to " + fx(q.dscrHigh) + ", based on the rent estimate range."
        : "";
      var target = !good && q.need.reachable ? Math.ceil(q.need.downPct * 100) / 100 : null;
      reach.hidden = target == null;
      if (target != null) {
        reach.textContent = "Set down payment to " + pct(target) + " to reach 1.0";
        reach.onclick = function () { st.downPct = target; setSlider(); load(); slider.focus(); };
      }
      for (var t in segBtn) segBtn[t].v.textContent = fx(q.byTerm[t].dscr);
      sRent.textContent = money(q.monthlyRent);
      sPay.textContent = money(q.pitia);
      sFlow.textContent = (q.monthlyCashFlow >= 0 ? "+" : "") + money(q.monthlyCashFlow);
      sFlow.className = q.monthlyCashFlow >= 0 ? "pos" : "neg";
      var rows = [
        ["Estimated rent", "", money(q.monthlyRent) + "/mo"],
        [(st.term === "io" ? "Interest" : "Principal and interest"), (q.rate * 100).toFixed(3) + "% rate, " + money(Number(d.price) - q.downPayment) + " loan", money(q.monthlyPI)],
        ["Property tax", q.usedListingTax ? "from listing" : "estimate", money(q.monthlyTax)],
        ["Insurance", "estimate", money(q.monthlyInsurance)],
      ];
      if (q.monthlyHoa) rows.push(["HOA dues", "from listing", money(q.monthlyHoa)]);
      tbody.replaceChildren.apply(tbody, rows.map(function (r) {
        return el("tr", {}, [el("td", {}, [r[0], r[1] ? el("small", { textContent: "  " + r[1] }) : null]), el("td", { textContent: r[2] })]);
      }).concat([el("tr", { className: "total" }, [el("td", { textContent: "Total monthly payment" }), el("td", { textContent: money(q.pitia) })])]));
    }

    function load() {
      clearTimeout(st.timer);
      if (st.ctrl) st.ctrl.abort();
      var ctrl = (st.ctrl = new AbortController()), seq = ++st.seq;
      var to = setTimeout(function () { ctrl.abort(); }, 12000);
      quoteView.classList.add("busy");
      fetch(origin + "/api/widget", {
        method: "POST",
        headers: { "content-type": "application/json" },
        signal: ctrl.signal,
        body: JSON.stringify({
          address: d.address, city: d.city, state: d.state, zip: d.zip, price: d.price,
          beds: d.beds, baths: d.baths, sqft: d.sqft, taxAnnual: d.taxAnnual, hoaMonthly: d.hoaMonthly,
          downPct: st.downPct, interestOnly: st.term === "io", fortyYear: st.term === "40",
        }),
      })
        .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.error || "Unavailable"); return j; }); })
        .then(function (q) {
          if (seq !== st.seq) return;
          st.quote = q;
          quoteView.classList.remove("busy");
          if (quoteView.hidden && formView.hidden && doneView.hidden) show(quoteView);
          paint(q);
          host.dispatchEvent(new CustomEvent("revestor:quote", { bubbles: true, detail: { dscr: q.dscr, downPct: q.downPct, term: st.term } }));
        })
        .catch(function (e) {
          if (seq !== st.seq) return;
          quoteView.classList.remove("busy");
          var msg = e.name === "AbortError" ? "This is taking longer than expected." : e.message || "We could not estimate this property right now.";
          var retry = el("button", { type: "button", className: "cta", textContent: "Try again" });
          retry.onclick = function () { show(st.quote ? quoteView : skeleton); load(); };
          errView.replaceChildren(el("p", { className: "err", textContent: msg, attrs: { role: "alert" } }), retry);
          show(errView);
        })
        .finally(function () { clearTimeout(to); });
    }

    /* ---------- lead form ---------- */
    function showForm() {
      var q = st.quote;
      var termName = { "30": "30-year", "40": "40-year", io: "interest-only" }[st.term];
      function field(id, label, type, auto, mode) {
        var input = el("input", { id: id, name: id, type: type, autocomplete: auto, required: true, attrs: mode ? { inputmode: mode } : {} });
        var msg = el("small", { attrs: { "aria-live": "polite" } });
        input.setAttribute("aria-describedby", id + "-e");
        msg.id = id + "-e";
        return { wrap: el("div", { className: "f" }, [el("label", { htmlFor: id, textContent: label }), input, msg]), input: input, msg: msg };
      }
      var name = field("rv-name", "Full name", "text", "name");
      var email = field("rv-email", "Email", "email", "email", "email");
      var phone = field("rv-phone", "Mobile phone", "tel", "tel", "tel");
      phone.input.oninput = function () {
        var x = phone.input.value.replace(/\D/g, "").slice(0, 10);
        phone.input.value = x.length > 6 ? "(" + x.slice(0, 3) + ") " + x.slice(3, 6) + "-" + x.slice(6) : x.length > 3 ? "(" + x.slice(0, 3) + ") " + x.slice(3) : x;
      };
      var hp = el("input", { type: "text", name: "website", className: "hp", tabIndex: -1, autocomplete: "off", attrs: { "aria-hidden": "true" } });
      var consent = el("input", { type: "checkbox", id: "rv-consent", name: "consent" });
      var cMsg = el("small", { style: "color:var(--red);font-size:11.5px", attrs: { "aria-live": "polite" } });
      var err = el("p", { className: "err", attrs: { role: "alert" } });
      var send = el("button", { type: "submit", className: "cta" }, ["Send to a loan officer ", el("em", { textContent: "→" })]);
      var back = el("button", { type: "button", className: "ghost", textContent: "Back to estimate" });
      back.onclick = function () { show(quoteView); cta.focus(); };
      var checks = [
        [name, function (v) { return v.trim().length >= 2 ? "" : "Enter your name"; }],
        [email, function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "" : "Enter a valid email"; }],
        [phone, function (v) { return v.replace(/\D/g, "").length === 10 ? "" : "Enter a 10-digit phone number"; }],
      ];
      function check(c) {
        var m = c[1](c[0].input.value);
        c[0].msg.textContent = m;
        c[0].input.setAttribute("aria-invalid", String(!!m));
        return !m;
      }
      checks.forEach(function (c) { c[0].input.onblur = function () { if (c[0].input.value) check(c); }; });
      var form = el("form", { noValidate: true }, [
        el("div", { className: "recap" }, [
          el("b", { textContent: [d.address, d.city].filter(Boolean).join(", ") || "This property" }),
          el("span", { textContent: money(Number(d.price)) + " · " + pct(st.downPct) + " down · " + termName + " · DSCR " + fx(q.dscr) }),
        ]),
        name.wrap, email.wrap, phone.wrap, hp,
        el("label", { className: "consent", htmlFor: "rv-consent" }, [consent, el("span", { textContent:
          "I agree that Griffin Funding may contact me by phone, text and email about this request, including with automated technology. Consent is not a condition of any loan. Message and data rates may apply." })]),
        cMsg, err, send, back,
      ]);
      form.onkeydown = function (e) { if (e.key === "Escape") back.click(); };
      form.onsubmit = function (e) {
        e.preventDefault();
        err.textContent = "";
        var bad = checks.filter(function (c) { return !check(c); });
        cMsg.textContent = consent.checked ? "" : "Please agree so we can contact you";
        if (bad.length) { bad[0][0].input.focus(); return; }
        if (!consent.checked) { consent.focus(); return; }
        send.disabled = true;
        fetch(origin + "/api/leads", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            name: name.input.value, email: email.input.value, phone: phone.input.value, website: hp.value, consent: true,
            listingSummary: [d.address, d.city, d.state, d.zip].filter(Boolean).join(", ") + " | " + money(Number(d.price)) + " | DSCR " + fx(q.dscr),
            search: { source: "widget", host: location.hostname, downPct: st.downPct, term: st.term, rate: q.rate, monthlyRent: q.monthlyRent },
            referrer: location.href,
          }),
        })
          .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.error || "Could not send"); }); })
          .then(function () {
            var again = el("button", { type: "button", className: "ghost", textContent: "Back to estimate" });
            again.onclick = function () { show(quoteView); cta.focus(); };
            var tickSvg = svg("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "#061b57", "stroke-width": 2.6, "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true" });
            tickSvg.append(svg("path", { d: "M5 12.5l4.5 4.5L19 7.5" }));
            var h = el("h3", { textContent: "Request sent", tabIndex: -1 });
            doneView.replaceChildren(el("div", { className: "done", attrs: { role: "status" } }, [
              el("div", { className: "tick" }, [tickSvg]), h,
              el("p", { textContent: "A Griffin Funding loan officer will follow up about this property." }),
              el("p", { textContent: "They will have your scenario: " + pct(st.downPct) + " down, " + termName + ", DSCR " + fx(q.dscr) + "." }),
            ]), again);
            show(doneView);
            h.focus();
            host.dispatchEvent(new CustomEvent("revestor:lead", { bubbles: true, detail: { dscr: q.dscr, downPct: st.downPct, term: st.term } }));
          })
          .catch(function (x) { err.textContent = x.message; send.disabled = false; });
      };
      formView.replaceChildren(form);
      show(formView);
      name.input.focus();
    }

    if (!(Number(d.price) > 0) || !/^\d{5}$/.test(d.zip || "")) {
      errView.replaceChildren(el("p", { className: "err", textContent: "This listing is missing a price or ZIP code, so an estimate is not available." }));
      show(errView);
      return;
    }
    setSlider();
    load();
  }

  function init() {
    var hosts = document.querySelectorAll("[data-revestor-widget]");
    if (hosts.length) fonts();
    hosts.forEach(function (h) { if (!h.shadowRoot) mount(h); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
