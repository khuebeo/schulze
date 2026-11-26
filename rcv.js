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
      ballots.push(label ? { ranking, count: 1, line: i + 1, label } : { ranking, count: 1, line: i + 1 });
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

  // Khoảng cách Levenshtein giữa hai chuỗi.
  function editDistance(a, b) {
    const m = a.length, n = b.length;
    let prev = Array.from({ length: n + 1 }, (_, j) => j);
    for (let i = 1; i <= m; i++) {
      const cur = [i];
      for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = cur;
    }
    return prev[n];
  }

  // Tìm các chỗ có thể nhập sai. Chỉ là cảnh báo, không ảnh hưởng kết quả.
  //  - similar:    hai tên rất giống nhau (có thể gõ nhầm), ví dụ spaghetti / spaghetto
  //  - rare:       tên chỉ xuất hiện trong đúng 1 phiếu (khi có từ 3 phiếu trở lên)
  //  - incomplete: phiếu không xếp đủ mọi ứng viên; gộp các phiếu thiếu cùng những tên
  function checkBallots(ballots) {
    const warnings = [];
    const display = new Map(), seenIn = new Map();
    ballots.forEach((b) => b.ranking.flat().forEach((name) => {
      const k = name.toLocaleLowerCase();
      if (!display.has(k)) display.set(k, name);
      if (!seenIn.has(k)) seenIn.set(k, []);
      seenIn.get(k).push(b.line);
    }));
    const keys = [...display.keys()];

    const flagged = new Set();
    for (let x = 0; x < keys.length; x++) for (let y = x + 1; y < keys.length; y++) {
      const a = keys[x], b = keys[y], len = Math.min(a.length, b.length);
      if (len < 3) continue;
      const limit = len >= 7 ? 2 : 1;
      if (editDistance(a, b) > limit) continue;
      // Đưa tên ít gặp hơn lên trước: đó thường là tên gõ nhầm.
      const [r, c] = seenIn.get(a).length <= seenIn.get(b).length ? [a, b] : [b, a];
      warnings.push({ code: "similar", a: display.get(r), b: display.get(c), lines: seenIn.get(r) });
      flagged.add(r);
    }
    if (ballots.length >= 3) for (const k of keys) {
      if (seenIn.get(k).length === 1 && !flagged.has(k)) warnings.push({ code: "rare", name: display.get(k), line: seenIn.get(k)[0] });
    }

    const groups = new Map();
    for (const b of ballots) {
      const have = new Set(b.ranking.flat().map((n) => n.toLocaleLowerCase()));
      const missing = keys.filter((k) => !have.has(k));
      if (!missing.length) continue;
      const gk = missing.join("\u0000");
      if (!groups.has(gk)) groups.set(gk, { code: "incomplete", missing: missing.map((k) => display.get(k)), lines: [] });
      groups.get(gk).lines.push(b.line);
    }
    warnings.push(...groups.values());
    return warnings;
  }

  const api = { parseBallots, runSchulze, checkBallots };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.RCV = api;
})(this);
