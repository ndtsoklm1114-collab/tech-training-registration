exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const body = JSON.parse(event.body || "{}");
  const key = body.key || "";
  const ids = body.ids || [];
  const adminKey = process.env.ADMIN_KEY || "ptrc2026";

  if (key !== adminKey) {
    return { statusCode: 401, body: JSON.stringify({ error: "密碼錯誤" }) };
  }

  if (!ids.length) {
    return { statusCode: 400, body: JSON.stringify({ error: "未選取任何項目" }) };
  }

  const token = process.env.NETLIFY_API_TOKEN;
  if (!token) {
    return { statusCode: 500, body: JSON.stringify({ error: "未設定 API Token" }) };
  }

  const results = [];
  for (const id of ids) {
    try {
      const res = await fetch(
        `https://api.netlify.com/api/v1/submissions/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      results.push({ id, status: res.status });
    } catch (err) {
      results.push({ id, status: 500, error: err.message });
    }
  }

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ deleted: results }),
  };
};
