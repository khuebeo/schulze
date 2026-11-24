const assert = require("assert");
const { parseBallots, runSchulze } = require("./rcv.js");
const run = (t) => runSchulze(parseBallots(t).ballots);

// 1. Ví dụ kinh điển trên Wikipedia (45 phiếu, A..E) -> E > A > C > B > D
const expand = (arr) => arr.flatMap((l) => { const [n, b] = l.split(": "); return Array(+n).fill(b); });
let r = run(expand(["5: A > C > B > E > D", "5: A > D > E > C > B", "8: B > E > D > A > C", "3: C > A > B > E > D",
  "7: C > A > E > B > D", "2: C > B > A > D > E", "7: D > C > E > B > A", "8: E > B > A > D > C"]).join("\n"));
assert.deepStrictEqual(r.winners, ["E"]);
assert.deepStrictEqual(r.order, ["E", "A", "C", "B", "D"]);
const I = (x) => r.candidates.indexOf(x);
assert.strictEqual(r.d[I("A")][I("B")], 20); assert.strictEqual(r.p[I("E")][I("A")], 25); assert.strictEqual(r.p[I("A")][I("E")], 24);
assert.strictEqual(r.condorcet, null);
// Đường mạnh nhất E -> A là E -> D -> C -> A (25 = min(33? ...)); kiểm tra sức mạnh bằng cạnh yếu nhất
for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) if (i !== j) {
  const pth = r.path(i, j);
  if (r.p[i][j] === 0) { assert.strictEqual(pth, null); continue; }
  assert.strictEqual(pth[0], i); assert.strictEqual(pth[pth.length - 1], j);
  const links = pth.slice(1).map((c, k) => r.d[pth[k]][c]);
  assert.strictEqual(Math.min(...links), r.p[i][j]);
}

// 2. Có người thắng Condorcet
r = run(expand(["3: A > B > C", "2: B > C > A", "2: C > B > A"]).join("\n"));
assert.strictEqual(r.condorcet, "B"); assert.deepStrictEqual(r.winners, ["B"]);

// 3. Hoà
r = run("A > B\nB > A");
assert.deepStrictEqual(r.winners, ["A", "B"]); assert.strictEqual(r.ranking.length, 1);

// 4. Ứng viên không có trên phiếu bị xếp sau; ngang hạng bằng "="
r = run("A > B\nC\nB = C > A");
// A>B:1, B>A:1 (phiếu 3), A>C:1, C>A:2, B>C:1, C>B:1 -> C thắng A, còn lại hoà
assert.strictEqual(r.d[r.candidates.indexOf("C")][r.candidates.indexOf("A")], 2);

// 5. Phân tích phiếu
const p = parseBallots("a, B, A\nb > a\nb > a\n\n# chú thích");
assert.strictEqual(p.ballots.length, 3); assert.deepStrictEqual(p.ballots[0].ranking, [["a"], ["B"]]);
assert.strictEqual(p.errors.length, 1);
r = runSchulze(p.ballots); assert.deepStrictEqual(r.winners, ["B"]); assert.strictEqual(r.candidates.length, 2);

// 7. Placeholder trong i18n.js phải đọc được và không có lỗi
{
  const src = require("fs").readFileSync(__dirname + "/i18n.js", "utf8");
  const ph = JSON.parse(src.match(/const EXAMPLE = ("[^"]*")/)[1]);
  const q2 = parseBallots(ph); assert.strictEqual(q2.errors.length, 0); assert.strictEqual(q2.ballots.length, 6);
  assert.strictEqual(runSchulze(q2.ballots).candidates.length, 6);
}
// 6. Nhãn người bầu
const q = parseBallots("Japan: 1 > 2 > 3 = 4 > 5 = 6\nVietnam: 1 = 2 > 3 > 4 > 6 > 5\nTaiwan: 1 > 2 > 3 > 4 > 5 > 6");
assert.strictEqual(q.errors.length, 0); assert.strictEqual(q.ballots.length, 3);
assert.strictEqual(q.ballots[0].label, "Japan"); assert.strictEqual(q.ballots[0].count, 1);
assert.deepStrictEqual(q.ballots[0].ranking, [["1"], ["2"], ["3", "4"], ["5", "6"]]);
assert.deepStrictEqual(q.ballots[1].ranking, [["1", "2"], ["3"], ["4"], ["6"], ["5"]]);
r = runSchulze(q.ballots); assert.deepStrictEqual(r.winners, ["1"]); assert.strictEqual(r.candidates.length, 6);
const c = parseBallots("12: A > B").ballots[0]; assert.strictEqual(c.count, 1); assert.strictEqual(c.label, "12");

console.log("Tất cả kiểm thử đều qua.");
