(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const EXAMPLE = [
    "# Ví dụ: 45 người chọn món ăn trưa",
    "5: Phở > Cơm tấm > Bún chả > Bánh mì > Hủ tiếu",
    "5: Phở > Hủ tiếu > Bánh mì > Cơm tấm > Bún chả",
    "8: Bún chả > Bánh mì > Hủ tiếu > Phở > Cơm tấm",
    "3: Cơm tấm > Phở > Bún chả > Bánh mì > Hủ tiếu",
    "7: Cơm tấm > Phở > Bánh mì > Bún chả > Hủ tiếu",
    "2: Cơm tấm > Bún chả > Phở > Hủ tiếu > Bánh mì",
    "7: Hủ tiếu > Cơm tấm > Bánh mì > Bún chả > Phở",
    "8: Bánh mì > Bún chả > Phở > Hủ tiếu > Cơm tấm",
  ].join("\n");

  // Bảng ma trận, hàng/cột theo thứ tự xếp hạng. Ô xanh = hàng thắng cột.
  function matrix(res, M, caption) {
    const o = res.orderIdx;
    const head = o.map((j) => `<th title="${esc(res.candidates[j])}">${esc(res.candidates[j])}</th>`).join("");
    const rows = o.map((i) => "<tr><th>" + esc(res.candidates[i]) + "</th>" + o.map((j) => {
      if (i === j) return '<td class="self">–</td>';
      const cls = M[i][j] > M[j][i] ? "w" : M[i][j] < M[j][i] ? "l" : "t";
      return `<td class="${cls}">${M[i][j]}</td>`;
    }).join("") + "</tr>").join("");
    return `<div class="scroll"><table class="matrix"><caption>${caption}</caption><thead><tr><th></th>${head}</tr></thead><tbody>${rows}</tbody></table></div>`;
  }

  function render(res, errors) {
    const errBox = $("errors");
    errBox.hidden = errors.length === 0;
    errBox.innerHTML = errors.map((e) => "<div>" + esc(e) + "</div>").join("");
    if (!res) { $("result").hidden = true; return; }
    $("result").hidden = false;

    let head = res.winners.length === 1
      ? `<div class="winner">🏆 Người thắng: <strong>${esc(res.winners[0])}</strong></div>`
      : `<div class="winner tie">Hoà giữa: <strong>${esc(res.winners.join(", "))}</strong>. Cần một quy tắc phá hoà riêng.</div>`;
    head += `<p class="stats">${res.totalBallots} phiếu · ${res.candidates.length} ứng viên · ` +
      (res.condorcet ? `${esc(res.condorcet)} là người thắng Condorcet` : "không có người thắng Condorcet") + "</p>";
    $("summary").innerHTML = head;

    const rank = "<h3>Bảng xếp hạng</h3><ol class=\"ranking\">" + res.ranking.map((g) =>
      `<li value="${g.place}">${esc(g.names.join(" = "))}</li>`).join("") + "</ol>";
    $("rounds").innerHTML = rank +
      "<h3>Đối đầu trực tiếp</h3><p class=\"note\">Mỗi ô là số người thích ứng viên ở hàng hơn ứng viên ở cột.</p>" +
      matrix(res, res.d, "") +
      "<h3>Đường mạnh nhất</h3><p class=\"note\">Mỗi ô là sức mạnh đường mạnh nhất từ hàng đến cột. Ô xanh nghĩa là hàng được xếp trên cột.</p>" +
      matrix(res, res.p, "");
    $("result").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function run() {
    const { ballots, errors } = RCV.parseBallots($("ballots").value);
    if (ballots.length === 0) return render(null, errors.concat(["Chưa có phiếu hợp lệ nào."]));
    const res = RCV.runSchulze(ballots);
    if (res.candidates.length < 2) errors.push("Cần ít nhất 2 ứng viên để so sánh.");
    render(res, errors);
  }

  $("run").addEventListener("click", run);
  $("example").addEventListener("click", () => { $("ballots").value = EXAMPLE; run(); });
  $("clear").addEventListener("click", () => { $("ballots").value = ""; $("result").hidden = true; $("errors").hidden = true; });
  $("file").addEventListener("change", (e) => {
    const f = e.target.files[0];
    if (!f) return;
    f.text().then((t) => { $("ballots").value = t; run(); });
    e.target.value = "";
  });
})();
