// Phương pháp Schulze cho bầu chọn xếp hạng. Không phụ thuộc thư viện nào.
(function (root) {
  "use strict";

  // Đọc văn bản phiếu bầu. Mỗi dòng là đúng một phiếu:
  //   A > B > C
  //   Japan: B > A       (tên người bầu ở đầu dòng, không bắt buộc)
  //   A, C, B            (dấu phẩy cũng được)
  //   A > B = C > D      (dấu = nghĩa là ngang hạng)
  function parseBallots(text) {
    const ballots = [];
    const errors = [];
    String(text).split(/\r?\n/).forEach((raw, i) => {
      let line = raw.trim();
      if (!line || line.startsWith("#")) return;
      // Nhãn tên người bầu ở đầu dòng, ví dụ "Japan: 1 > 2". Chỉ để hiển thị, không ảnh hưởng kết quả.
      let label = null;
      const lm = line.match(/^([^:>,;=\t]+?)\s*:\s*(.*)$/);
      if (lm) { label = lm[1].trim(); line = lm[2].trim(); }
      const sep = line.includes(">") ? ">" : line.includes(",") ? "," : line.includes(";") ? ";" : line.includes("\t") ? "\t" : ">";
      const ranking = []; // mảng các nhóm ngang hạng
      const seen = new Set();
      for (const part of line.split(sep)) {
        const group = [];
        for (const piece of part.split("=")) {
          const name = piece.trim();
          if (!name) continue;
          const key = name.toLocaleLowerCase();
          if (seen.has(key)) { errors.push({ code: "duplicate", line: i + 1, name }); continue; }
          seen.add(key);
          group.push(name);
        }
        if (group.length) ranking.push(group);
      }
      if (ranking.length === 0) { errors.push({ code: "empty", line: i + 1 }); return; }
      ballots.push(label ? { ranking, count: 1, label } : { ranking, count: 1 });
    });
    return { ballots, errors };
  }

  // Chạy Schulze. Ứng viên không có trên phiếu được coi là xếp sau mọi ứng viên có trên phiếu.
  function runSchulze(ballots, opts) {
    opts = opts || {};
    const display = new Map();
    const add = (n) => { const k = n.trim().toLocaleLowerCase(); if (k && !display.has(k)) display.set(k, n.trim()); };
    for (const b of ballots) for (const g of b.ranking) g.forEach(add);
    (opts.extraCandidates || []).forEach(add);
    const keys = [...display.keys()];
    const names = keys.map((k) => display.get(k));
    const n = keys.length;
    const idx = new Map(keys.map((k, i) => [k, i]));
    const zero = () => Array.from({ length: n }, () => Array(n).fill(0));
    const totalBallots = ballots.reduce((s, b) => s + b.count, 0);

    // d[i][j] = số người thích i hơn j
    const d = zero();
    for (const b of ballots) {
      const rank = Array(n).fill(Infinity);
      b.ranking.forEach((g, r) => g.forEach((name) => { rank[idx.get(name.toLocaleLowerCase())] = r; }));
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (rank[i] < rank[j]) d[i][j] += b.count;
    }

    // p[i][j] = sức mạnh của đường mạnh nhất từ i đến j (biến thể Floyd–Warshall)
    const p = zero();
    // nxt[i][j] = bước kế tiếp sau i trên đường mạnh nhất từ i đến j (để dựng lại đường đi).
    const nxt = Array.from({ length: n }, () => Array(n).fill(-1));
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (i !== j && d[i][j] > d[j][i]) { p[i][j] = d[i][j]; nxt[i][j] = j; }
    for (let k = 0; k < n; k++) for (let i = 0; i < n; i++) if (i !== k) for (let j = 0; j < n; j++) {
      if (j === i || j === k) continue;
      const via = Math.min(p[i][k], p[k][j]);
      if (via > p[i][j]) { p[i][j] = via; nxt[i][j] = nxt[i][k]; }
    }
    // path(i, j) -> mảng chỉ số ứng viên từ i đến j, hoặc null nếu không có đường.
    const path = (i, j) => {
      if (nxt[i][j] < 0) return null;
      const out = [i];
      for (let c = i; c !== j && out.length <= n; ) { c = nxt[c][j]; out.push(c); }
      return out;
    };

    // Xếp hạng: i đứng trên j nếu p[i][j] > p[j][i] (quan hệ này có tính bắc cầu).
    const beats = names.map((_, i) => names.reduce((s, _, j) => s + (i !== j && p[i][j] > p[j][i] ? 1 : 0), 0));
    const order = names.map((_, i) => i).sort((a, b) => beats[b] - beats[a] || names[a].localeCompare(names[b]));
    const ranking = [];
    for (const i of order) {
      const last = ranking[ranking.length - 1];
      if (last && beats[last.members[0]] === beats[i]) last.members.push(i);
      else ranking.push({ place: ranking.reduce((s, g) => s + g.members.length, 0) + 1, members: [i] });
    }
    const rankingOut = ranking.map((g) => ({ place: g.place, names: g.members.map((i) => names[i]) }));
    const winners = n ? rankingOut[0].names : [];

    // Người thắng Condorcet (thắng tất cả trong đối đầu trực tiếp), nếu có.
    let condorcet = null;
    for (let i = 0; i < n; i++) if (names.every((_, j) => j === i || d[i][j] > d[j][i])) condorcet = names[i];

    return { candidates: names, order: order.map((i) => names[i]), orderIdx: order, totalBallots, d, p, path, ranking: rankingOut, winners, condorcet };
  }

  const api = { parseBallots, runSchulze };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.RCV = api;
})(this);
