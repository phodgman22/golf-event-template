import * as S from "../scoring.js";

let pass = 0, fail = 0;
const eq = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (ok) { pass++; console.log(`  ok   ${label}`); }
  else { fail++; console.log(`  FAIL ${label}\n         got  ${JSON.stringify(got)}\n         want ${JSON.stringify(want)}`); }
};

const holes = [1, 2, 3].map(n => ({ number: n, par: 4, si: n }));
const format = "rolling-best-ball-net";
// Scratch players — gross in, gross out, so the numbers below are exactly what's compared.
const scratch = id => ({ memberIds: [id], playerPhs: { [id]: 0 }, holeCount: 18 });
const ctxs = { a: scratch("a"), b: scratch("b"), c: scratch("c"), d: scratch("d") };
const box = (pid, v) => ({ [pid]: { v } });

console.log("\ncomputeHoleResult — rolling best ball scores a single player exactly like individual");
eq("scratch player, one entry", S.computeHoleResult(format, holes[0], box("a", 4), ctxs.a), { net: 4, gross: 4 });
eq("no entry yet", S.computeHoleResult(format, holes[0], {}, ctxs.a), null);

console.log("\nrollingBestBallTotals — best 2 of 4, everyone posted every hole");
const scores1 = {
  a: { 1: box("a", 4), 2: box("a", 6), 3: box("a", 5) },
  b: { 1: box("b", 5), 2: box("b", 4), 3: box("b", 5) },
  c: { 1: box("c", 6), 2: box("c", 3), 3: box("c", 5) },
  d: { 1: box("d", 7), 2: box("d", 8), 3: box("d", 4) }
};
const r1 = S.rollingBestBallTotals(format, holes, scores1, ctxs, 2);
eq("hole 1: lowest two are a(4)+b(5)", r1.perHole[0], { hole: 1, counted: ["a", "b"], score: 9 });
eq("hole 2: lowest two are c(3)+b(4)", r1.perHole[1], { hole: 2, counted: ["c", "b"], score: 7 });
eq("hole 3: a, b and c tie at 5 — d(4) plus one of the 5s", r1.perHole[2].score, 9);
eq("total across all three holes", r1.total, 9 + 7 + 9);

console.log("\nrollingBestBallTotals — a hole nobody's posted yet doesn't count, but doesn't block later holes");
const scores2 = {
  a: { 1: box("a", 4), 3: box("a", 5) },
  b: { 1: box("b", 5), 3: box("b", 6) }
};
const r2 = S.rollingBestBallTotals(format, holes, scores2, { a: ctxs.a, b: ctxs.b }, 2);
eq("hole 1 counts both (only two on the team)", r2.perHole[0], { hole: 1, counted: ["a", "b"], score: 9 });
eq("hole 2: nobody's posted — unresolved, not zero", r2.perHole[1], { hole: 2, counted: [], score: null });
eq("hole 3 still resolves on its own", r2.perHole[2], { hole: 3, counted: ["a", "b"], score: 11 });
eq("total skips the null hole entirely", r2.total, 9 + 11);

console.log("\nrollingBestBallTotals — fewer players posted than bestCount: counts what's there, not zero-padded");
const scores3 = {
  a: { 1: box("a", 4) },
  b: { 1: box("b", 7) },
  c: {}
};
const r3 = S.rollingBestBallTotals(format, holes.slice(0, 1), scores3, { a: ctxs.a, b: ctxs.b, c: ctxs.c }, 4);
eq("only two of four have posted — both count, nothing invented for the other two", r3.perHole[0], { hole: 1, counted: ["a", "b"], score: 11 });

console.log("\nrollingBestBallTotals — bestCount larger than the whole team just counts everyone");
const r4 = S.rollingBestBallTotals(format, holes.slice(0, 1), scores1, ctxs, 99);
eq("all four count when bestCount exceeds team size", r4.perHole[0].counted.sort(), ["a", "b", "c", "d"]);
eq("score is the sum of all four", r4.perHole[0].score, 4 + 5 + 6 + 7);

console.log("\nrollingBestBallTotals — no bestCount (0/undefined) means count everyone, same as an oversized bestCount");
const r5a = S.rollingBestBallTotals(format, holes.slice(0, 1), scores1, ctxs, 0);
const r5b = S.rollingBestBallTotals(format, holes.slice(0, 1), scores1, ctxs, undefined);
eq("bestCount 0 counts everyone", r5a.perHole[0].score, 4 + 5 + 6 + 7);
eq("bestCount undefined counts everyone", r5b.perHole[0].score, 4 + 5 + 6 + 7);

console.log("\nrollingBestBallTotals — handicap strokes can change who makes the cut");
// a plays off 0, b plays off 1 shot on SI 1 (hole 1). Gross a=5, gross b=6 -> net a=5, net b=5 (tie).
const hcpCtxs = {
  a: { memberIds: ["a"], playerPhs: { a: 0 }, holeCount: 18 },
  b: { memberIds: ["b"], playerPhs: { b: 1 }, holeCount: 18 }
};
const scores6 = { a: { 1: box("a", 5) }, b: { 1: box("b", 6) } };
const r6 = S.rollingBestBallTotals(format, [{ number: 1, par: 4, si: 1 }], scores6, hcpCtxs, 1);
eq("net scores tie at 5 — first sorted (stable) counts, worth 5 either way", r6.perHole[0].score, 5);

console.log("\nrollingBestBallTotals — gross variant ignores handicap strokes entirely");
const r7 = S.rollingBestBallTotals("rolling-best-ball-gross", [{ number: 1, par: 4, si: 1 }], scores6, hcpCtxs, 1);
eq("gross: b's actual 6 counts, a's 5 is lower and wins the slot", r7.perHole[0], { hole: 1, counted: ["a"], score: 5 });

console.log(`\n${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
