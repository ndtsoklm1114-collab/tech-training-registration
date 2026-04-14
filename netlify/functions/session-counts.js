const SESSIONS = [
  "6/10（三）屏中區 上午場",
  "6/10（三）屏中區 下午場",
  "6/11（四）屏中區 上午場",
  "6/11（四）屏中區 下午場",
  "6/17（三）屏北區 上午場",
  "6/17（三）屏北區 下午場",
  "6/18（四）屏北區 上午場",
  "6/18（四）屏北區 下午場",
];
const MAX_PER_SESSION = 30;

async function getSubmissions(token, siteId) {
  const formsRes = await fetch(
    `https://api.netlify.com/api/v1/sites/${siteId}/forms`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const forms = await formsRes.json();
  const form = forms.find((f) => f.name === "training-registration");
  if (!form) return [];

  const subRes = await fetch(
    `https://api.netlify.com/api/v1/forms/${form.id}/submissions?per_page=300`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return subRes.json();
}

exports.handler = async function () {
  const token = process.env.NETLIFY_API_TOKEN;
  const siteId = process.env.SITE_ID;

  // Default counts if not configured
  const defaultCounts = {};
  SESSIONS.forEach((s) => {
    defaultCounts[s] = { registered: 0, remaining: MAX_PER_SESSION };
  });

  if (!token || !siteId) {
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=15" },
      body: JSON.stringify(defaultCounts),
    };
  }

  try {
    const submissions = await getSubmissions(token, siteId);
    const registered = {};
    submissions.forEach((sub) => {
      const s = sub.data?.session;
      if (s) registered[s] = (registered[s] || 0) + 1;
    });

    const counts = {};
    SESSIONS.forEach((s) => {
      const reg = registered[s] || 0;
      counts[s] = { registered: reg, remaining: Math.max(0, MAX_PER_SESSION - reg) };
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=15" },
      body: JSON.stringify(counts),
    };
  } catch (err) {
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(defaultCounts),
    };
  }
};
