/*
 * Revestor DSCR widget (PRIVATE DEMO).
 * Usage on a listing page:
 *   <div data-revestor-widget data-address="..." data-city="..." data-state="CA" data-zip="93706"
 *        data-price="349000" data-beds="3" data-baths="2" data-sqft="1420"
 *        data-tax-annual="3900" data-hoa-monthly="0"></div>
 *   <script src="https://<revestor host>/revestor-widget.js" defer></script>
 * It reads only the data-* values the page gives it. It does not read or copy anything else from the page.
 */
(function () {
  var script = document.currentScript;
  var origin = script ? new URL(script.src).origin : location.origin;
  var money = function (n) { return "$" + Math.round(n).toLocaleString("en-US"); };
  var pct = function (n) { return (n * 100).toFixed(n * 100 % 1 ? 1 : 0) + "%"; };

  var CSS =
    ":host{all:initial;display:block;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#333}" +
    "*{box-sizing:border-box}.box{border:1px solid rgba(51,51,51,.18);border-radius:12px;background:#fff;padding:16px;max-width:380px}" +
    ".eyebrow{font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#6b6b6b;margin:0 0 6px}" +
    ".ratio{font-size:40px;line-height:1;font-weight:600;margin:0}.ratio.good{color:#1f6b3a}.ratio.warn{color:#8a5a00}" +
    ".range{font-size:12px;color:#6b6b6b;margin:4px 0 10px}.msg{font-size:14px;margin:0 0 12px;line-height:1.4}" +
    ".opts{display:flex;flex-wrap:wrap;gap:8px 14px;margin:0 0 12px;font-size:13px;align-items:center}" +
    "select{font:inherit;padding:4px 6px;border:1px solid rgba(51,51,51,.28);border-radius:6px;background:#fff}" +
    "table{width:100%;border-collapse:collapse;font-size:13px;margin:0 0 12px}td{padding:3px 0}td:last-child{text-align:right;font-variant-numeric:tabular-nums}" +
    "tr.total td{border-top:1px solid rgba(51,51,51,.18);font-weight:600;padding-top:6px}" +
    "button{font:inherit;cursor:pointer;border:0;border-radius:8px;padding:10px 14px;background:#bd0c0c;color:#fff;font-weight:600;width:100%}" +
    "button:hover{background:#970a0a}button.link{background:none;color:#6b6b6b;font-weight:400;width:auto;padding:6px 0;text-decoration:underline}" +
    "form{display:grid;gap:8px}input[type=text],input[type=email],input[type=tel]{font:inherit;padding:8px;border:1px solid rgba(51,51,51,.28);border-radius:6px;width:100%}" +
    ".consent{font-size:11px;color:#6b6b6b;display:flex;gap:6px;align-items:flex-start;line-height:1.35}" +
    ".hp{position:absolute;left:-9999px}.err{color:#bd0c0c;font-size:13px;margin:0}" +
    ".fine{font-size:10.5px;color:#6b6b6b;line-height:1.4;margin:12px 0 0}details{font-size:13px;margin:0 0 12px}summary{cursor:pointer;color:#6b6b6b}";

  function mount(host) {
    var d = host.dataset;
    var state = { downPct: 0.2, interestOnly: false, fortyYear: false, quote: null, view: "quote", error: "" };
    var root = host.attachShadow({ mode: "open" });
    var style = document.createElement("style");
    style.textContent = CSS;
    var box = document.createElement("div");
    box.className = "box";
    root.append(style, box);

    function el(tag, props, kids) {
      var n = document.createElement(tag);
      Object.assign(n, props || {});
      (kids || []).forEach(function (k) { n.append(k); });
      return n;
    }
    function row(label, value, cls) {
      return el("tr", { className: cls || "" }, [el("td", { textContent: label }), el("td", { textContent: value })]);
    }

    function load() {
      state.error = "";
      fetch(origin + "/api/widget", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          address: d.address, city: d.city, state: d.state, zip: d.zip, price: d.price,
          beds: d.beds, baths: d.baths, sqft: d.sqft, taxAnnual: d.taxAnnual, hoaMonthly: d.hoaMonthly,
          downPct: state.downPct, interestOnly: state.interestOnly, fortyYear: state.fortyYear,
        }),
      })
        .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.error || "Unavailable"); return j; }); })
        .then(function (q) { state.quote = q; render(); })
        .catch(function (e) { state.quote = null; state.error = e.message; render(); });
    }

    function render() {
      box.replaceChildren(el("p", { className: "eyebrow", textContent: "Investor financing estimate" }));
      if (state.error) { box.append(el("p", { className: "err", textContent: state.error })); return; }
      var q = state.quote;
      if (!q) { box.append(el("p", { className: "msg", textContent: "Estimating…" })); return; }
      if (state.view === "sent") {
        box.append(el("p", { className: "msg", textContent: "Thanks. A Griffin Funding loan officer will follow up about this property." }));
        return;
      }
      var good = q.dscr >= 1;
      box.append(el("p", { className: "ratio " + (good ? "good" : "warn"), textContent: q.dscr.toFixed(2) + " DSCR" }));
      if (q.dscrLow && q.dscrHigh) {
        box.append(el("p", { className: "range", textContent: "Range " + q.dscrLow.toFixed(2) + " to " + q.dscrHigh.toFixed(2) + " on the rent estimate range" }));
      }
      var msg = good
        ? "Estimated rent covers the payment at " + pct(q.downPct) + " down."
        : q.need.reachable
          ? "Reaches 1.0 at about " + pct(q.need.downPct) + " down (" + money(q.need.downPayment) + ")."
          : "Does not reach 1.0 within 50% down on these terms.";
      box.append(el("p", { className: "msg", textContent: msg }));

      if (state.view === "form") { box.append(form(q)); return; }

      var down = el("select", { ariaLabel: "Down payment" });
      [0.2, 0.25, 0.3, 0.35, 0.4, 0.5].forEach(function (p) {
        down.append(el("option", { value: String(p), textContent: pct(p) + " down", selected: p === state.downPct }));
      });
      down.onchange = function () { state.downPct = Number(down.value); load(); };
      var term = el("select", { ariaLabel: "Loan type" });
      [["30", "30-year"], ["40", "40-year"], ["io", "Interest-only"]].forEach(function (t) {
        var sel = t[0] === "io" ? state.interestOnly : t[0] === "40" ? state.fortyYear : !state.interestOnly && !state.fortyYear;
        term.append(el("option", { value: t[0], textContent: t[1], selected: sel }));
      });
      term.onchange = function () { state.interestOnly = term.value === "io"; state.fortyYear = term.value === "40"; load(); };
      box.append(el("div", { className: "opts" }, [down, term]));

      var t = el("table", {}, [
        row("Estimated rent", money(q.monthlyRent) + "/mo"),
        row("Principal and interest at " + (q.rate * 100).toFixed(3) + "%", money(q.monthlyPI)),
        row(q.usedListingTax ? "Property tax (from listing)" : "Property tax (estimate)", money(q.monthlyTax)),
        row("Insurance (estimate)", money(q.monthlyInsurance)),
      ]);
      if (q.monthlyHoa) t.append(row("HOA (from listing)", money(q.monthlyHoa)));
      t.append(row("Total payment", money(q.pitia), "total"));
      box.append(el("details", {}, [el("summary", { textContent: "How this is calculated" }), t]));

      var cta = el("button", { type: "button", textContent: "Check my loan options" });
      cta.onclick = function () { state.view = "form"; render(); };
      box.append(cta);
      box.append(el("p", { className: "fine", textContent:
        "Estimate only, provided by Griffin Funding. Not a loan offer, approval or commitment to lend. Rent, rate, taxes and insurance are estimates and will differ. " +
        "Demo: rent and rate are sample values." }));
    }

    function form(q) {
      var f = el("form");
      var name = el("input", { type: "text", name: "name", placeholder: "Full name", required: true, autocomplete: "name" });
      var email = el("input", { type: "email", name: "email", placeholder: "Email", required: true, autocomplete: "email" });
      var phone = el("input", { type: "tel", name: "phone", placeholder: "Mobile phone", required: true, autocomplete: "tel" });
      var hp = el("input", { type: "text", name: "website", className: "hp", tabIndex: -1, autocomplete: "off" });
      var consent = el("input", { type: "checkbox", name: "consent", required: true });
      var label = el("label", { className: "consent" }, [consent, el("span", { textContent:
        "I agree that Griffin Funding may contact me by phone, text and email about this request, including with automated technology. " +
        "Consent is not a condition of any loan. Message and data rates may apply." })]);
      var err = el("p", { className: "err", role: "alert" });
      var send = el("button", { type: "submit", textContent: "Send to a loan officer" });
      var back = el("button", { type: "button", className: "link", textContent: "Back" });
      back.onclick = function () { state.view = "quote"; render(); };
      f.append(name, email, phone, hp, label, err, send, back);
      f.onsubmit = function (e) {
        e.preventDefault();
        send.disabled = true;
        fetch(origin + "/api/leads", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            name: name.value, email: email.value, phone: phone.value, website: hp.value, consent: consent.checked,
            listingSummary: [d.address, d.city, d.state, d.zip].filter(Boolean).join(", ") + " | " + money(Number(d.price)) + " | DSCR " + q.dscr.toFixed(2),
            search: { source: "widget", host: location.hostname, downPct: state.downPct, interestOnly: state.interestOnly, fortyYear: state.fortyYear },
            referrer: location.href,
          }),
        })
          .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.error || "Could not send"); }); })
          .then(function () { state.view = "sent"; render(); })
          .catch(function (x) { err.textContent = x.message; send.disabled = false; });
      };
      return f;
    }

    render();
    load();
  }

  function init() {
    document.querySelectorAll("[data-revestor-widget]").forEach(function (h) { if (!h.shadowRoot) mount(h); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
