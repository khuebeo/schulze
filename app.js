(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const t = (k, v) => I18N.t(k, v);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  // Thay biến đã escape vào chuỗi dịch.
  const tEsc = (k, v) => t(k, Object.fromEntries(Object.entries(v).map(([a, b]) => [a, esc(b)])));

  let last = null; // kết quả gần nhất, để vẽ lại khi đổi ngôn ngữ

  // Bảng ma trận, hàng/cột theo thứ tự xếp hạng. Ô xanh = hàng thắng cột.
  function matrix(res, M, tip) {
    const o = res.orderIdx;
    const head = o.map((j) => `<th>${esc(res.candidates[j])}</th>`).join("");
    const rows = o.map((i) => "<tr><th>" + esc(res.candidates[i]) + "</th>" + o.map((j) => {
      if (i === j) return '<td class="self">–</td>';
      const cls = M[i][j] > M[j][i] ? "w" : M[i][j] < M[j][i] ? "l" : "t";
      const tipText = tip ? tip(i, j) : "";
      const attr = tipText ? ` data-tip="${esc(tipText)}" aria-label="${esc(tipText)}" tabindex="0"` : "";
      return `<td class="${cls}"${attr}>${M[i][j]}</td>`;
    }).join("") + "</tr>").join("");
    return `<div class="scroll"><table class="matrix"><thead><tr><th></th>${head}</tr></thead><tbody>${rows}</tbody></table></div>`;
  }

  // [1,2,3,5,7,8] -> "1–3, 5, 7–8"
  function lineList(lines) {
    const parts = [];
    for (let k = 0; k < lines.length; k++) {
      let e = k;
      while (e + 1 < lines.length && lines[e + 1] === lines[e] + 1) e++;
      parts.push(e > k ? lines[k] + "–" + lines[e] : String(lines[k]));
      k = e;
    }
    return parts.join(", ");
  }

  function warningText(w) {
    if (w.code === "similar") return t("warnSimilar", { a: w.a, b: w.b, lines: lineList(w.lines) });
    if (w.code === "rare") return t("warnRare", { name: w.name, line: w.line });
    return t("warnIncomplete", { count: w.lines.length, missing: w.missing.join(", "), lines: lineList(w.lines) });
  }

  function errorText(e) {
    if (typeof e === "string") return t(e);
    return t(e.code === "duplicate" ? "errDuplicate" : "errEmpty", { line: e.line, name: e.name });
  }

  function render(scroll) {
    hideTip();
    if (!last) return;
    const { res, errors } = last;
    const warnBox = $("warnings");
    const warns = last.warnings || [];
    warnBox.hidden = warns.length === 0;
    warnBox.innerHTML = warns.length ? `<strong>${esc(t("warnTitle"))}</strong><ul>` + warns.map((w) => "<li>" + esc(warningText(w)) + "</li>").join("") + "</ul>" : "";
    const errBox = $("errors");
    errBox.hidden = errors.length === 0;
    errBox.innerHTML = errors.map((e) => "<div>" + esc(errorText(e)) + "</div>").join("");
    if (!res) { $("result").hidden = true; return; }
    $("result").hidden = false;

    let head = res.winners.length === 1
      ? `<div class="winner">${tEsc("winner", { name: res.winners[0] }).replace(esc(res.winners[0]), "<strong>$&</strong>")}</div>`
      : `<div class="winner tie">${tEsc("tie", { names: res.winners.join(", ") })}</div>`;
    head += `<p class="stats">${esc(t("stats", { ballots: res.totalBallots, candidates: res.candidates.length }))} · ` +
      (res.condorcet ? tEsc("condorcetYes", { name: res.condorcet }) : esc(t("condorcetNo"))) + "</p>";
    $("summary").innerHTML = head;

    $("rounds").innerHTML =
      `<h3>${esc(t("rankingTitle"))}</h3><ol class="ranking">` +
      res.ranking.map((g) => `<li value="${g.place}">${esc(g.names.join(" = "))}</li>`).join("") + "</ol>" +
      `<h3>${esc(t("pairwiseTitle"))}</h3><p class="note">${esc(t("pairwiseNote"))}</p>` + matrix(res, res.d, (i, j) => {
        const n = res.d[i][j], v = { n, u: res.candidates[i], v: res.candidates[j] };
        return n === 1 && I18N.has("pairTip1") ? t("pairTip1", v) : t("pairTip", v);
      }) +
      `<h3>${esc(t("pathsTitle"))}</h3><p class="note">${esc(t("pathsNote"))}</p>` + matrix(res, res.p, (i, j) => {
        const u = res.candidates[i], v = res.candidates[j], pth = res.path(i, j);
        if (!pth) return t("pathNone", { u, v });
        // Cạnh yếu nhất của đường đi (lấy cạnh đầu tiên nếu có nhiều cạnh bằng nhau).
        let w = 0;
        for (let k = 1; k < pth.length - 1; k++) if (res.d[pth[k]][pth[k + 1]] < res.d[pth[w]][pth[w + 1]]) w = k;
        return t("pathTip", { u, v, n: res.p[i][j], path: pth.map((c) => res.candidates[c]).join(" → "),
          a: res.candidates[pth[w]], b: res.candidates[pth[w + 1]] });
      });
    if (scroll) $("result").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function run() {
    const { ballots, errors } = RCV.parseBallots($("ballots").value);
    if (ballots.length === 0) { last = { res: null, errors: errors.concat(["errNoBallots"]) }; return render(); }
    const res = RCV.runSchulze(ballots);
    if (res.candidates.length < 2) errors.push("errFewCandidates");
    last = { res, errors, warnings: RCV.checkBallots(ballots) };
    render(true);
  }

  function applyLanguage() {
    document.documentElement.lang = I18N.lang === "zh" ? "zh-Hans" : I18N.lang;
    document.title = t("title");
    document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll("[data-i18n-html]").forEach((el) => { el.innerHTML = t(el.dataset.i18nHtml); }); // chuỗi dịch tĩnh, tin cậy
    $("ballots").placeholder = t("placeholder");
    $("about").innerHTML = t("about").map((s) => "<li>" + esc(s) + "</li>").join("");
    $("lang").value = I18N.lang;
    render(false);
  }

  // Chú thích khi di chuột (máy tính) hoặc chạm (điện thoại) vào ô có data-tip.
  const tipBox = document.createElement("div");
  tipBox.className = "tip"; tipBox.hidden = true; tipBox.setAttribute("role", "tooltip");
  document.body.appendChild(tipBox);
  let tipFor = null;
  function showTip(cell) {
    tipFor = cell;
    tipBox.textContent = cell.dataset.tip;
    tipBox.hidden = false;
    const r = cell.getBoundingClientRect(), b = tipBox.getBoundingClientRect();
    const left = Math.min(Math.max(8, r.left + r.width / 2 - b.width / 2), document.documentElement.clientWidth - b.width - 8);
    const top = r.top - b.height - 8 < 0 ? r.bottom + 8 : r.top - b.height - 8;
    tipBox.style.left = left + window.scrollX + "px";
    tipBox.style.top = top + window.scrollY + "px";
  }
  function hideTip() { tipBox.hidden = true; tipFor = null; }
  const cellOf = (e) => e.target.closest && e.target.closest("td[data-tip]");
  document.addEventListener("pointerover", (e) => { const c = cellOf(e); if (c && e.pointerType === "mouse") showTip(c); });
  document.addEventListener("pointerout", (e) => { const c = cellOf(e); if (c && e.pointerType === "mouse" && !c.contains(e.relatedTarget)) hideTip(); });
  // Chạm/bấm vào ô luôn hiện chú thích (không bật/tắt), vì trên điện thoại sự kiện focus đến
  // ngay trước click và trước đây click lại ẩn chú thích vừa hiện. Chạm ra ngoài để ẩn.
  document.addEventListener("click", (e) => { const c = cellOf(e); if (c) showTip(c); else hideTip(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") hideTip(); });
  document.addEventListener("focusin", (e) => { const c = cellOf(e); if (c) showTip(c); });
  document.addEventListener("focusout", (e) => { if (cellOf(e) && !(e.relatedTarget && cellOf({ target: e.relatedTarget }))) hideTip(); });
  // Trên điện thoại, thanh địa chỉ ẩn/hiện khi cuộn cũng gây "resize"; chỉ ẩn khi bề ngang đổi.
  let lastW = window.innerWidth;
  window.addEventListener("resize", () => { if (window.innerWidth !== lastW) { lastW = window.innerWidth; hideTip(); } });

  $("lang").innerHTML = I18N.languages.map((l) => `<option value="${l.code}">${esc(l.name)}</option>`).join("");
  $("lang").addEventListener("change", (e) => { I18N.set(e.target.value); applyLanguage(); });
  $("run").addEventListener("click", run);
  $("example").addEventListener("click", () => { $("ballots").value = t("exampleText"); run(); });
  $("clear").addEventListener("click", () => { $("ballots").value = ""; last = null; $("result").hidden = true; $("errors").hidden = true; $("warnings").hidden = true; });
  $("file").addEventListener("change", (e) => {
    const f = e.target.files[0];
    if (!f) return;
    f.text().then((txt) => { $("ballots").value = txt; run(); });
    e.target.value = "";
  });
  applyLanguage();
})();
