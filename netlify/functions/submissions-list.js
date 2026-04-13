exports.handler = async function (event) {
  // 密碼驗證
  const key = event.queryStringParameters?.key || "";
  const adminKey = process.env.ADMIN_KEY || "ptrc2026";

  if (key !== adminKey) {
    return { statusCode: 401, body: JSON.stringify({ error: "密碼錯誤" }) };
  }

  const token = process.env.NETLIFY_API_TOKEN;
  const siteId = process.env.SITE_ID;

  if (!token || !siteId) {
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify([]),
    };
  }

  try {
    // Get form ID
    const formsRes = await fetch(
      `https://api.netlify.com/api/v1/sites/${siteId}/forms`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const forms = await formsRes.json();
    const form = forms.find((f) => f.name === "training-registration");

    if (!form) {
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([]),
      };
    }

    // Get all submissions
    const subRes = await fetch(
      `https://api.netlify.com/api/v1/forms/${form.id}/submissions?per_page=300`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const rawSubmissions = await subRes.json();

    // Map to clean format
    const submissions = rawSubmissions.map((sub) => ({
      id: sub.id || "",
      name: sub.data?.name || "",
      unit: sub.data?.unit || "",
      title: sub.data?.title || "",
      phone: sub.data?.phone || "",
      email: sub.data?.email || "",
      session: sub.data?.session || "",
      notes: sub.data?.notes || "",
      submitted_at: sub.created_at || "",
    }));

    // Sort newest first
    submissions.sort(
      (a, b) => new Date(b.submitted_at) - new Date(a.submitted_at)
    );

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-cache" },
      body: JSON.stringify(submissions),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
