const assert = require("assert");
const { parseBallots, runSchulze } = require("./rcv.js");
const run = (t) => runSchulze(parseBallots(t).ballots);

// 1. Ví dụ kinh điển trên Wikipedia (45 phiếu, A..E) -> E > A > C > B > D
let r = run(["5: A > C > B > E > D", "5: A > D > E > C > B", "8: B > E > D > A > C", "3: C > A > B > E > D",
  "7: C > A > E > B > D", "2: C > B > A > D > E", "7: D > C > E > B > A", "8: E > B > A > D > C"].join("\n"));
assert.deepStrictEqual(r.winners, ["E"]);
assert.deepStrictEqual(r.order, ["E", "A", "C", "B", "D"]);
const I = (x) => r.candidates.indexOf(x);
assert.strictEqual(r.d[I("A")][I("B")], 20); assert.strictEqual(r.p[I("E")][I("A")], 25); assert.strictEqual(r.p[I("A")][I("E")], 24);
assert.strictEqual(r.condorcet, null);

// 2. Có người thắng Condorcet
r = run("3: A > B > C\n2: B > C > A\n2: C > B > A");
assert.strictEqual(r.condorcet, "B"); assert.deepStrictEqual(r.winners, ["B"]);

// 3. Hoà
r = run("A > B\nB > A");
assert.deepStrictEqual(r.winners, ["A", "B"]); assert.strictEqual(r.ranking.length, 1);

// 4. Ứng viên không có trên phiếu bị xếp sau; ngang hạng bằng "="
r = run("A > B\nC\nB = C > A");
// A>B:1, B>A:1 (phiếu 3), A>C:1, C>A:2, B>C:1, C>B:1 -> C thắng A, còn lại hoà
assert.strictEqual(r.d[r.candidates.indexOf("C")][r.candidates.indexOf("A")], 2);

// 5. Phân tích phiếu
const p = parseBallots("a, B, A\n2x b > a\n\n# chú thích");
assert.strictEqual(p.ballots.length, 2); assert.deepStrictEqual(p.ballots[0].ranking, [["a"], ["B"]]);
assert.strictEqual(p.ballots[1].count, 2); assert.strictEqual(p.errors.length, 1);
r = runSchulze(p.ballots); assert.deepStrictEqual(r.winners, ["B"]); assert.strictEqual(r.candidates.length, 2);

console.log("Tất cả kiểm thử đều qua.");
