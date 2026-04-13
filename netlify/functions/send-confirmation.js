exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: "未設定 RESEND_API_KEY" }) };
  }

  const data = JSON.parse(event.body || "{}");
  const { name, email, session, unit, title } = data;

  if (!email || !name || !session) {
    return { statusCode: 400, body: JSON.stringify({ error: "缺少必要欄位" }) };
  }

  // Determine location and contact based on session
  const isCenter = session.includes("屏中區");
  const location = isCenter ? "屏東縣輔具資源中心（屏中區）" : "屏東縣輔具資源中心（屏北區）";
  const contact = isCenter
    ? "(08) 789-9599 #22 陳社工"
    : "(08) 736-5455 #24 孫社工";

  const htmlBody = `
    <div style="font-family: 'PingFang TC', 'Noto Sans TC', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #0D7377, #14919B); padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: #fff; font-size: 20px; margin: 0;">【科技守護．智慧安居】</h1>
        <p style="color: rgba(255,255,255,0.85); font-size: 14px; margin: 8px 0 0;">長照人員科技輔具教育訓練</p>
      </div>
      <div style="background: #fff; padding: 24px; border: 1px solid #e2e8f0; border-top: none;">
        <h2 style="color: #0D7377; font-size: 18px; margin: 0 0 16px;">報名成功！🎉</h2>
        <p style="color: #333; font-size: 15px; line-height: 1.8; margin: 0 0 16px;">
          <strong>${name}</strong> 您好，<br>
          您已成功報名以下場次：
        </p>
        <div style="background: #F0F9F9; border-left: 4px solid #0D7377; padding: 16px; border-radius: 0 8px 8px 0; margin: 16px 0;">
          <p style="margin: 0; font-size: 15px; color: #333;">
            <strong>場次：</strong>${session}<br>
            <strong>時間：</strong>上午 09:00 - 12:00（共 3 小時）<br>
            <strong>地點：</strong>${location}<br>
            <strong>姓名：</strong>${name}<br>
            <strong>單位：</strong>${unit || "-"}<br>
            <strong>職稱：</strong>${title || "-"}
          </p>
        </div>
        <p style="color: #333; font-size: 14px; line-height: 1.8; margin: 16px 0;">
          如有任何問題，請聯繫：<br>
          <strong>${contact}</strong>
        </p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
        <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
          主辦｜屏東縣政府社會處 ・ 委辦｜屏東縣輔具資源中心（屏中區／屏北區）<br>
          © 2026 社團法人屏東縣輔具應用及身心健康促進協會
        </p>
      </div>
    </div>
  `;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "屏東縣輔具資源中心 <onboarding@resend.dev>",
        to: [email],
        subject: `【報名成功】科技守護．智慧安居 — ${session}`,
        html: htmlBody,
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      return {
        statusCode: res.status,
        body: JSON.stringify({ error: result.message || "寄信失敗" }),
      };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: true, id: result.id }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
