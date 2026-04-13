const { getStore } = require("@netlify/blobs");

exports.handler = async function (event) {
  // 簡易密碼驗證
  const key = event.queryStringParameters?.key || "";
  const adminKey = process.env.ADMIN_KEY || "ptrc2026";

  if (key !== adminKey) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: "密碼錯誤" }),
    };
  }

  const store = getStore("submissions");
  const { blobs } = await store.list();

  const submissions = [];
  for (const blob of blobs) {
    const raw = await store.get(blob.key);
    if (raw) {
      try {
        submissions.push(JSON.parse(raw));
      } catch (e) {
        // skip malformed entries
      }
    }
  }

  // 依報名時間排序（最新在前）
  submissions.sort(
    (a, b) => new Date(b.submitted_at) - new Date(a.submitted_at)
  );

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
    },
    body: JSON.stringify(submissions),
  };
};
