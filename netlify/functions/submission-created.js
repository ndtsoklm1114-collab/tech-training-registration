const { getStore } = require("@netlify/blobs");

exports.handler = async function (event) {
  const { payload } = JSON.parse(event.body);
  const data = payload.data;
  const session = data.session;

  if (!session) {
    return { statusCode: 200, body: "no session field" };
  }

  // 1. 更新場次報名人數
  const countStore = getStore("session-counts");
  const raw = await countStore.get(session);
  const current = raw ? parseInt(raw, 10) : 0;
  await countStore.set(session, String(current + 1));

  // 2. 儲存完整報名資料
  const subStore = getStore("submissions");
  const key = Date.now() + "-" + Math.random().toString(36).slice(2, 8);
  await subStore.set(
    key,
    JSON.stringify({
      name: data.name || "",
      unit: data.unit || "",
      title: data.title || "",
      phone: data.phone || "",
      email: data.email || "",
      session: session,
      notes: data.notes || "",
      submitted_at: payload.created_at || new Date().toISOString(),
    })
  );

  return { statusCode: 200, body: "ok" };
};
