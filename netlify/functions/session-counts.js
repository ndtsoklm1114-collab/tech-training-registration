const { getStore } = require("@netlify/blobs");

const SESSIONS = [
  "6/10（三）屏中區",
  "6/11（四）屏中區",
  "6/17（三）屏北區",
  "6/18（四）屏北區",
];
const MAX_PER_SESSION = 30;

exports.handler = async function () {
  const store = getStore("session-counts");
  const counts = {};

  for (const s of SESSIONS) {
    const raw = await store.get(s);
    const registered = raw ? parseInt(raw, 10) : 0;
    counts[s] = { registered, remaining: Math.max(0, MAX_PER_SESSION - registered) };
  }

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=10",
    },
    body: JSON.stringify(counts),
  };
};
