(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const t = (k, v) => I18N.t(k, v);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  // Thay biến đã escape vào chuỗi dịch.
  const tEsc = (k, v) => t(k, Object.fromEntries(Object.entries(v).map(([a, b]) => [a, esc(b)])));

  let last = null; // kết quả gần nhất, để vẽ lại khi đổi ngôn ngữ

  // Bảng ma trận, hàng/cột theo thứ tự xếp hạng. Ô xanh = hàng thắng cột.
  function matrix(res, M) {
    const o = res.orderIdx;
    const head = o.map((j) => `<th>${esc(res.candidates[j])}</th>`).join("");
    const rows = o.map((i) => "<tr><th>" + esc(res.candidates[i]) + "</th>" + o.map((j) => {
      if (i === j) return '<td class="self">–</td>';
      const cls = M[i][j] > M[j][i] ? "w" : M[i][j] < M[j][i] ? "l" : "t";
      return `<td class="${cls}">${M[i][j]}</td>`;
    }).join("") + "</tr>").join("");
    return `<div class="scroll"><table class="matrix"><thead><tr><th></th>${head}</tr></thead><tbody>${rows}</tbody></table></div>`;
  }

  function errorText(e) {
    if (typeof e === "string") return t(e);
    return t(e.code === "duplicate" ? "errDuplicate" : "errEmpty", { line: e.line, name: e.name });
  }

  function render(scroll) {
    if (!last) return;
    const { res, errors } = last;
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
      `<h3>${esc(t("pairwiseTitle"))}</h3><p class="note">${esc(t("pairwiseNote"))}</p>` + matrix(res, res.d) +
      `<h3>${esc(t("pathsTitle"))}</h3><p class="note">${esc(t("pathsNote"))}</p>` + matrix(res, res.p);
    if (scroll) $("result").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function run() {
    const { ballots, errors } = RCV.parseBallots($("ballots").value);
    if (ballots.length === 0) { last = { res: null, errors: errors.concat(["errNoBallots"]) }; return render(); }
    const res = RCV.runSchulze(ballots);
    if (res.candidates.length < 2) errors.push("errFewCandidates");
    last = { res, errors };
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

  $("lang").innerHTML = I18N.languages.map((l) => `<option value="${l.code}">${esc(l.name)}</option>`).join("");
  $("lang").addEventListener("change", (e) => { I18N.set(e.target.value); applyLanguage(); });
  $("run").addEventListener("click", run);
  $("example").addEventListener("click", () => { $("ballots").value = t("exampleText"); run(); });
  $("clear").addEventListener("click", () => { $("ballots").value = ""; last = null; $("result").hidden = true; $("errors").hidden = true; });
  $("file").addEventListener("change", (e) => {
    const f = e.target.files[0];
    if (!f) return;
    f.text().then((txt) => { $("ballots").value = txt; run(); });
    e.target.value = "";
  });
  applyLanguage();
})();
