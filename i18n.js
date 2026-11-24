// Bản dịch giao diện. Thêm ngôn ngữ mới bằng cách thêm một khoá vào STRINGS.
(function (root) {
  "use strict";

  // Ví dụ mẫu dùng cùng một bộ phiếu (ví dụ 45 phiếu trên Wikipedia), chỉ đổi tên món ăn.
  const PATTERN = [[5, "ACBED"], [5, "ADECB"], [8, "BEDAC"], [3, "CABED"], [7, "CAEBD"], [2, "CBADE"], [7, "DCEBA"], [8, "EBADC"]];
  const makeExample = (comment, names) => [comment].concat(PATTERN.flatMap(([n, s]) =>
    Array(n).fill([...s].map((c) => names["ABCDE".indexOf(c)]).join(" > ")))).join("\n");

  const STRINGS = {
    vi: {
      langName: "Tiếng Việt",
      title: "Tính kết quả bầu chọn xếp hạng (Schulze)",
      h1: "Tính kết quả bầu chọn xếp hạng",
      sub: "Ranked Choice Voting, phương pháp Schulze. Mọi tính toán chạy ngay trong trình duyệt, không gửi dữ liệu đi đâu.",
      inputTitle: "1. Nhập phiếu bầu",
      hint: "Mỗi dòng là một phiếu, xếp ứng viên từ thích nhất đến ít thích nhất, ngăn cách bằng <code>&gt;</code> hoặc dấu phẩy. Dùng <code>=</code> cho các ứng viên ngang hạng. Có thể ghi tên người bầu ở đầu dòng, ví dụ <code>Japan: sushi &gt; pho</code>. Dòng bắt đầu bằng <code>#</code> được bỏ qua.",
      placeholder: "Japan: sushi > gimbab > sashimi = pho > pizza = spaghetti\nVietnam: sushi = gimbab > sashimi > pho > spaghetti > pizza\nTaiwan: sushi > gimbab > sashimi > pho > pizza > spaghetti\nKorea: gimbab > sushi > pho > sashimi > spaghetti > pizza\nIndonesia: pho > sushi = gimbab > pizza > spaghetti > sashimi\nThailand: pho > sushi > gimbab > sashimi > spaghetti > pizza",
      upload: "Tải tệp CSV/TXT", example: "Dùng ví dụ mẫu", clear: "Xoá", run: "Tính kết quả",
      resultTitle: "2. Kết quả",
      winner: "🏆 Người thắng: {name}",
      tie: "Hoà giữa: {names}. Cần một quy tắc phá hoà riêng.",
      stats: "{ballots} phiếu · {candidates} ứng viên",
      condorcetYes: "{name} là người thắng Condorcet", condorcetNo: "không có người thắng Condorcet",
      rankingTitle: "Bảng xếp hạng",
      pairwiseTitle: "Đối đầu trực tiếp",
      pairwiseNote: "Mỗi ô là số người thích ứng viên ở hàng hơn ứng viên ở cột. Di chuột hoặc chạm vào ô để xem giải thích.",
      pairTip: "{n} người xếp {u} trên {v}",
      pathTip: "Đường mạnh nhất từ {u} đến {v}: {path}\nSức mạnh {n}, bằng trận thắng yếu nhất trong chuỗi: {n} người xếp {a} trên {b}.",
      pathNone: "Không có chuỗi trận thắng nào đi từ {u} đến {v}, nên sức mạnh là 0.",
      pathsTitle: "Đường mạnh nhất",
      pathsNote: "Mỗi ô là sức mạnh đường mạnh nhất từ hàng đến cột. Ô xanh nghĩa là hàng được xếp trên cột. Di chuột hoặc chạm vào ô để xem đường đi.",
      errDuplicate: "Dòng {line}: \"{name}\" xuất hiện nhiều lần, chỉ tính lần đầu.",
      errEmpty: "Dòng {line}: phiếu trống, bỏ qua.",
      errNoBallots: "Chưa có phiếu hợp lệ nào.",
      errFewCandidates: "Cần ít nhất 2 ứng viên để so sánh.",
      aboutTitle: "Cách tính",
      about: [
        "Với mỗi cặp ứng viên X và Y, đếm số người xếp X trên Y. Ứng viên không có trên phiếu được coi là xếp sau mọi ứng viên có trên phiếu.",
        "X thắng Y trong đối đầu trực tiếp nếu số người thích X hơn Y lớn hơn số người thích Y hơn X.",
        "Sức mạnh của một chuỗi X → A → … → Y là trận thắng yếu nhất trong chuỗi. Đường mạnh nhất từ X đến Y là chuỗi có sức mạnh lớn nhất.",
        "X xếp trên Y nếu đường mạnh nhất từ X đến Y mạnh hơn đường từ Y đến X. Người thắng là người không bị ai xếp trên.",
        "Nếu có ứng viên thắng tất cả mọi người khi đối đầu trực tiếp (người thắng Condorcet), Schulze luôn chọn người đó.",
      ],
      footer: "Mã nguồn mở, chạy hoàn toàn trên trình duyệt.",
      exampleText: makeExample("# Ví dụ: 45 người chọn món ăn trưa", ["Phở", "Bún chả", "Cơm tấm", "Hủ tiếu", "Bánh mì"]),
    },
    en: {
      langName: "English",
      title: "Ranked choice voting calculator (Schulze)",
      h1: "Ranked choice voting calculator",
      sub: "Computes results with the Schulze method. Everything runs in your browser; no data is sent anywhere.",
      inputTitle: "1. Enter ballots",
      hint: "One ballot per line, listing candidates from most to least preferred, separated by <code>&gt;</code> or commas. Use <code>=</code> for candidates ranked equally. You can put a voter name in front, e.g. <code>Japan: sushi &gt; pho</code>. Lines starting with <code>#</code> are ignored.",
      placeholder: "Japan: sushi > gimbab > sashimi = pho > pizza = spaghetti\nVietnam: sushi = gimbab > sashimi > pho > spaghetti > pizza\nTaiwan: sushi > gimbab > sashimi > pho > pizza > spaghetti\nKorea: gimbab > sushi > pho > sashimi > spaghetti > pizza\nIndonesia: pho > sushi = gimbab > pizza > spaghetti > sashimi\nThailand: pho > sushi > gimbab > sashimi > spaghetti > pizza",
      upload: "Load CSV/TXT file", example: "Load example", clear: "Clear", run: "Calculate",
      resultTitle: "2. Results",
      winner: "🏆 Winner: {name}",
      tie: "Tie between: {names}. A separate tie-breaking rule is needed.",
      stats: "{ballots} ballots · {candidates} candidates",
      condorcetYes: "{name} is the Condorcet winner", condorcetNo: "no Condorcet winner",
      rankingTitle: "Ranking",
      pairwiseTitle: "Head-to-head results",
      pairwiseNote: "Each cell is the number of voters who prefer the row candidate over the column candidate. Hover over or tap a cell for details.",
      pairTip: "{n} voters rank {u} above {v}", pairTip1: "1 voter ranks {u} above {v}",
      pathTip: "Strongest path from {u} to {v}: {path}\nStrength {n}, the weakest win in the chain: {n} voters rank {a} above {b}.",
      pathNone: "There is no chain of wins from {u} to {v}, so the strength is 0.",
      pathsTitle: "Strongest paths",
      pathsNote: "Each cell is the strength of the strongest path from the row to the column. A green cell means the row ranks above the column. Hover over or tap a cell to see the path.",
      errDuplicate: "Line {line}: \"{name}\" appears more than once; only the first is counted.",
      errEmpty: "Line {line}: empty ballot, skipped.",
      errNoBallots: "No valid ballots yet.",
      errFewCandidates: "At least 2 candidates are needed for a comparison.",
      aboutTitle: "How it works",
      about: [
        "For each pair of candidates X and Y, count how many voters rank X above Y. Candidates left off a ballot rank below every candidate on it.",
        "X beats Y head-to-head if more voters prefer X over Y than prefer Y over X.",
        "The strength of a chain X → A → … → Y is its weakest win. The strongest path from X to Y is the chain with the greatest strength.",
        "X ranks above Y if the strongest path from X to Y is stronger than the one from Y to X. The winner is the candidate nobody ranks above.",
        "If one candidate beats every other head-to-head (a Condorcet winner), Schulze always picks that candidate.",
      ],
      footer: "Open source, runs entirely in your browser.",
      exampleText: makeExample("# Example: 45 people choose lunch", ["Pizza", "Tacos", "Sushi", "Pasta", "Burgers"]),
    },
    ja: {
      langName: "日本語",
      title: "順位付け投票の集計（シュルツ方式）",
      h1: "順位付け投票の集計",
      sub: "シュルツ方式で結果を計算します。計算はすべてブラウザ内で行われ、データはどこにも送信されません。",
      inputTitle: "1. 投票を入力",
      hint: "1行に1票、候補者を好きな順に <code>&gt;</code> またはカンマで区切って書きます。同順位の候補者は <code>=</code> でつなぎます。行頭に投票者名を付けることもできます（例: <code>Japan: sushi &gt; pho</code>）。<code>#</code> で始まる行は無視されます。",
      placeholder: "Japan: sushi > gimbab > sashimi = pho > pizza = spaghetti\nVietnam: sushi = gimbab > sashimi > pho > spaghetti > pizza\nTaiwan: sushi > gimbab > sashimi > pho > pizza > spaghetti\nKorea: gimbab > sushi > pho > sashimi > spaghetti > pizza\nIndonesia: pho > sushi = gimbab > pizza > spaghetti > sashimi\nThailand: pho > sushi > gimbab > sashimi > spaghetti > pizza",
      upload: "CSV/TXTを読み込む", example: "例を読み込む", clear: "クリア", run: "集計する",
      resultTitle: "2. 結果",
      winner: "🏆 当選: {name}",
      tie: "同点: {names}。別途タイブレークのルールが必要です。",
      stats: "{ballots}票 · 候補者{candidates}名",
      condorcetYes: "{name}はコンドルセ勝者です", condorcetNo: "コンドルセ勝者はいません",
      rankingTitle: "順位",
      pairwiseTitle: "一対一の比較",
      pairwiseNote: "各セルは、行の候補者を列の候補者より好む投票者の数です。セルにマウスを重ねるかタップすると説明が表示されます。",
      pairTip: "{n}人が{u}を{v}より上位にしています",
      pathTip: "{u}から{v}への最強経路: {path}\n強さは{n}。連鎖の中で最も弱い勝ち（{n}人が{a}を{b}より上位）の値です。",
      pathNone: "{u}から{v}へ勝ちをつなぐ経路がないため、強さは0です。",
      pathsTitle: "最強経路",
      pathsNote: "各セルは、行から列への最強経路の強さです。緑のセルは行の候補者が列の候補者より上位であることを示します。セルにマウスを重ねるかタップすると経路が表示されます。",
      errDuplicate: "{line}行目: 「{name}」が複数回出てきます。最初のものだけを数えます。",
      errEmpty: "{line}行目: 空の票のためスキップしました。",
      errNoBallots: "有効な票がまだありません。",
      errFewCandidates: "比較には2名以上の候補者が必要です。",
      aboutTitle: "計算方法",
      about: [
        "候補者XとYの各ペアについて、XをYより上位にした投票者の数を数えます。票に書かれていない候補者は、書かれた候補者すべてより下位とみなします。",
        "XをYより好む人がYをXより好む人より多ければ、Xは一対一でYに勝ちます。",
        "連鎖 X → A → … → Y の強さは、その中で最も弱い勝ちの値です。XからYへの最強経路は、強さが最大の連鎖です。",
        "XからYへの最強経路がYからXへの最強経路より強ければ、XはYより上位です。誰からも上位とされない候補者が当選します。",
        "一対一で全員に勝つ候補者（コンドルセ勝者）がいれば、シュルツ方式は必ずその候補者を選びます。",
      ],
      footer: "オープンソース。すべてブラウザ内で動作します。",
      exampleText: makeExample("# 例: 45人が昼食を選ぶ", ["寿司", "ラーメン", "カレー", "うどん", "天ぷら"]),
    },
    zh: {
      langName: "中文",
      title: "排序复选投票计票（舒尔茨方法）",
      h1: "排序复选投票计票",
      sub: "使用舒尔茨方法计算结果。所有计算都在浏览器中完成，不会发送任何数据。",
      inputTitle: "1. 输入选票",
      hint: "每行一张选票，按从最喜欢到最不喜欢的顺序列出候选人，用 <code>&gt;</code> 或逗号分隔。并列的候选人用 <code>=</code> 连接。也可以在行首写上投票人名称，例如 <code>Japan: sushi &gt; pho</code>。以 <code>#</code> 开头的行会被忽略。",
      placeholder: "Japan: sushi > gimbab > sashimi = pho > pizza = spaghetti\nVietnam: sushi = gimbab > sashimi > pho > spaghetti > pizza\nTaiwan: sushi > gimbab > sashimi > pho > pizza > spaghetti\nKorea: gimbab > sushi > pho > sashimi > spaghetti > pizza\nIndonesia: pho > sushi = gimbab > pizza > spaghetti > sashimi\nThailand: pho > sushi > gimbab > sashimi > spaghetti > pizza",
      upload: "导入 CSV/TXT 文件", example: "载入示例", clear: "清空", run: "计算结果",
      resultTitle: "2. 结果",
      winner: "🏆 胜出者：{name}",
      tie: "平局：{names}。需要另行规定打破平局的规则。",
      stats: "{ballots} 张选票 · {candidates} 名候选人",
      condorcetYes: "{name} 是孔多塞胜者", condorcetNo: "没有孔多塞胜者",
      rankingTitle: "排名",
      pairwiseTitle: "两两对决",
      pairwiseNote: "每个单元格表示偏好行候选人胜过列候选人的选民人数。将鼠标悬停或点按单元格可查看说明。",
      pairTip: "{n} 名选民把 {u} 排在 {v} 之前",
      pathTip: "从 {u} 到 {v} 的最强路径：{path}\n强度为 {n}，即链条中最弱的一场胜利：{n} 名选民把 {a} 排在 {b} 之前。",
      pathNone: "从 {u} 到 {v} 没有任何胜利链条，因此强度为 0。",
      pathsTitle: "最强路径",
      pathsNote: "每个单元格表示从行到列的最强路径强度。绿色单元格表示行候选人排在列候选人之前。将鼠标悬停或点按单元格可查看路径。",
      errDuplicate: "第 {line} 行：“{name}”出现多次，只计算第一次。",
      errEmpty: "第 {line} 行：空白选票，已跳过。",
      errNoBallots: "还没有有效的选票。",
      errFewCandidates: "至少需要 2 名候选人才能比较。",
      aboutTitle: "计算方法",
      about: [
        "对每一对候选人 X 和 Y，统计把 X 排在 Y 之前的选民人数。选票上未列出的候选人视为排在所有已列出候选人之后。",
        "如果偏好 X 胜过 Y 的人多于偏好 Y 胜过 X 的人，则 X 在两两对决中胜过 Y。",
        "链条 X → A → … → Y 的强度是其中最弱的一场胜利。从 X 到 Y 的最强路径是强度最大的链条。",
        "如果从 X 到 Y 的最强路径强于从 Y 到 X 的最强路径，则 X 排在 Y 之前。没有被任何人排在前面的候选人胜出。",
        "如果有候选人在两两对决中胜过所有其他人（孔多塞胜者），舒尔茨方法一定会选出该候选人。",
      ],
      footer: "开源项目，完全在浏览器中运行。",
      exampleText: makeExample("# 示例：45 人选择午餐", ["饺子", "火锅", "烤鸭", "面条", "包子"]),
    },
  };

  const KEY = "rcv-lang";
  function detect() {
    const saved = (() => { try { return localStorage.getItem(KEY); } catch (e) { return null; } })();
    if (saved && STRINGS[saved]) return saved;
    for (const l of navigator.languages || [navigator.language || ""]) {
      const code = String(l).toLowerCase().slice(0, 2);
      if (STRINGS[code]) return code;
    }
    return "vi";
  }

  let lang = detect();
  const I18N = {
    languages: Object.keys(STRINGS).map((code) => ({ code, name: STRINGS[code].langName })),
    get lang() { return lang; },
    set(code) {
      if (!STRINGS[code]) return;
      lang = code;
      try { localStorage.setItem(KEY, code); } catch (e) { /* ignore */ }
    },
    has(key) { return key in STRINGS[lang]; },
    // t("winner", { name: "An" }) -> chuỗi đã thay biến. Giá trị biến KHÔNG được escape ở đây.
    t(key, vars) {
      const s = STRINGS[lang][key] ?? STRINGS.vi[key];
      if (typeof s !== "string") return s;
      return s.replace(/\{(\w+)\}/g, (m, k) => (vars && k in vars ? vars[k] : m));
    },
  };
  root.I18N = I18N;
})(this);
