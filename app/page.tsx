'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SESSIONS, UNIT_OPTIONS, MAX_PER_SESSION } from '@/lib/constants';

type SessionCounts = Record<string, { count: number; remaining: number }>;

export default function HomePage() {
  const router = useRouter();
  const [sessionCounts, setSessionCounts] = useState<SessionCounts>({});
  const [countsLoading, setCountsLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState('');
  const [unitValue, setUnitValue] = useState('');
  const [unitOther, setUnitOther] = useState('');
  const [titleValue, setTitleValue] = useState('');
  const [titleOther, setTitleOther] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadSessionCounts();
  }, []);

  async function loadSessionCounts() {
    try {
      const res = await fetch('/api/session-counts');
      if (res.ok) {
        const data = await res.json();
        setSessionCounts(data);
      }
    } catch {
      // fallback
    } finally {
      setCountsLoading(false);
    }
  }

  function getRemaining(sessionValue: string) {
    const info = sessionCounts[sessionValue];
    return info ? info.remaining : MAX_PER_SESSION;
  }

  function getRemainingLabel(sessionValue: string) {
    if (countsLoading) return { text: '查詢中...', style: { background: '#F0F0F0', color: '#999' } };
    const r = getRemaining(sessionValue);
    if (r <= 0) return { text: '已額滿', style: { background: '#FDE8E8', color: 'var(--error)' } };
    if (r <= 5) return { text: `剩餘 ${r} 位（即將額滿）`, style: { background: '#FFF3E0', color: '#E65100' } };
    if (r <= 10) return { text: `剩餘 ${r} 位`, style: { background: '#FFF3E0', color: '#E65100' } };
    return { text: `剩餘 ${r} 位`, style: { background: '#E8F5F5', color: 'var(--primary)' } };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;

    const finalUnit = unitValue === '__other__' ? unitOther.trim() : unitValue;
    const finalTitle = titleValue === '__other__' ? titleOther.trim() : titleValue;

    if (!selectedSession || !name.trim() || !finalUnit || !finalTitle || !phone.trim()) {
      alert('請填寫所有必填欄位');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          unit: finalUnit,
          title: finalTitle,
          phone: phone.trim(),
          email: email.trim() || null,
          session: selectedSession,
          notes: notes.trim() || null,
        }),
      });

      if (res.ok) {
        router.push('/success');
      } else {
        const data = await res.json();
        alert(data.error || '報名失敗，請稍後再試');
        setSubmitting(false);
      }
    } catch {
      alert('報名失敗，請稍後再試');
      setSubmitting(false);
    }
  }

  return (
    <>
      {/* Hero */}
      <header className="hero">
        <div className="hero-badge">屏東縣輔具資源中心</div>
        <h1>【科技守護．智慧安居】<br />長照人員科技輔具教育訓練</h1>
        <p>長照 3.0 智慧科技輔具新制 — 專業培訓報名</p>
      </header>

      <div className="main-container">
        {/* Info Section */}
        <section style={{ marginTop: '-0.5rem', marginBottom: '2rem' }}>
          {/* 活動資訊 */}
          <div className="info-card">
            <h2 className="section-title">
              <span className="section-icon" style={{ background: 'var(--primary)' }}>&#128205;</span>
              活動資訊
            </h2>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <span style={{ fontWeight: 600, minWidth: '5rem', flexShrink: 0 }}>對　象</span>
                <span style={{ color: 'var(--text-light)' }}>社區整合型服務中心個案管理人員（A個管）</span>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <span style={{ fontWeight: 600, minWidth: '5rem', flexShrink: 0 }}>報名方式</span>
                <span style={{ color: 'var(--text-light)' }}>採單位統一報名制</span>
              </div>
              <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: '#F4F9F9', borderRadius: '8px' }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--primary)', marginBottom: '0.4rem' }}>聯繫窗口</div>
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.3rem' }}>
                  <span style={{ fontWeight: 600, minWidth: '4rem' }}>屏中區</span>
                  <span style={{ color: 'var(--text-light)' }}>(08) 789-9599 #22 陳社工</span>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <span style={{ fontWeight: 600, minWidth: '4rem' }}>屏北區</span>
                  <span style={{ color: 'var(--text-light)' }}>(08) 736-5455 #24 孫社工</span>
                </div>
              </div>
            </div>
          </div>

          {/* 課程內容 */}
          <div className="info-card">
            <h2 className="section-title">
              <span className="section-icon" style={{ background: 'var(--primary)' }}>&#128218;</span>
              課程內容
            </h2>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
              <span className="module-tag exp">識能體驗</span>
              <span className="module-tag course">專業課程</span>
              <span className="module-tag test">即時測評力</span>
            </div>

            <h4 style={{ margin: '0 0 0.5rem', color: '#E65100', fontSize: '0.9rem' }}>&#9654; 上午場 09:00 – 12:00</h4>
            <table className="schedule-table">
              <thead><tr><th>時間</th><th>課程內容</th><th>講師</th></tr></thead>
              <tbody>
                <tr><td>08:50–09:00</td><td>學員報到及前測</td><td>工作人員</td></tr>
                <tr><td>09:00–10:00</td><td><span className="module-tag exp module-tag-sm">識能</span> 科技輔具落地應用展示</td><td>楊明勤 主任</td></tr>
                <tr><td>10:00–11:15</td><td><span className="module-tag course module-tag-sm">專業</span> 長照 3.0 科技輔具專業課程暨情境模擬分組討論</td><td>楊明勤 主任</td></tr>
                <tr><td>11:15–12:00</td><td><span className="module-tag test module-tag-sm">測評</span> 即時測評力（後測）暨會後討論</td><td>楊明勤 主任</td></tr>
              </tbody>
            </table>

            <h4 style={{ margin: '1.5rem 0 0.5rem', color: '#1565C0', fontSize: '0.9rem' }}>&#9654; 下午場 13:00 – 16:00</h4>
            <table className="schedule-table">
              <thead><tr><th>時間</th><th>課程內容</th><th>講師</th></tr></thead>
              <tbody>
                <tr><td>12:50–13:00</td><td>學員報到及前測</td><td>工作人員</td></tr>
                <tr><td>13:00–14:00</td><td><span className="module-tag exp module-tag-sm">識能</span> 科技輔具落地應用展示</td><td>楊明勤 主任</td></tr>
                <tr><td>14:00–15:15</td><td><span className="module-tag course module-tag-sm">專業</span> 長照 3.0 科技輔具專業課程暨情境模擬分組討論</td><td>楊明勤 主任</td></tr>
                <tr><td>15:15–16:00</td><td><span className="module-tag test module-tag-sm">測評</span> 即時測評力（後測）暨會後討論</td><td>楊明勤 主任</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Registration Form */}
        <section className="form-section">
          <h2 className="section-title" style={{ marginBottom: '0.25rem' }}>
            <span className="section-icon" style={{ background: 'var(--accent)' }}>&#9997;</span>
            線上報名
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '1.25rem' }}>
            每場次名額 30 人，額滿可登記候補。每人填寫一次即可。
          </p>

          <form onSubmit={handleSubmit}>
            {/* 選擇場次 */}
            <div className="form-group">
              <label>選擇場次 <span className="required">*</span></label>
              <div className="session-picker">
                {SESSIONS.map((s, i) => {
                  const remaining = getRemaining(s.value);
                  const isFull = !countsLoading && remaining <= 0;
                  const label = getRemainingLabel(s.value);
                  const isSelected = selectedSession === s.value;

                  return (
                    <div key={i}>
                      <div
                        className={`session-pick-label ${isSelected ? 'selected' : ''} ${isFull ? 'disabled' : ''}`}
                        onClick={() => { if (!isFull) setSelectedSession(s.value); }}
                      >
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.2rem', color: s.areaClass === 'north' ? '#7B61FF' : 'var(--accent)' }}>
                          {s.area} {s.date}
                        </span>
                        <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>{s.period}</span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginTop: '0.15rem' }}>{s.time}</span>
                        <span className="remaining-badge" style={label.style}>{label.text}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 姓名 */}
            <div className="form-group">
              <label>姓名 <span className="required">*</span></label>
              <input type="text" required placeholder="請輸入您的姓名" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            {/* 服務單位 */}
            <div className="form-group">
              <label>服務單位 <span className="required">*</span></label>
              <select required value={unitValue} onChange={(e) => setUnitValue(e.target.value)}>
                <option value="" disabled>請選擇您的服務單位</option>
                {UNIT_OPTIONS.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
                <option value="__other__">其他（自行填寫）</option>
              </select>
              {unitValue === '__other__' && (
                <input type="text" required placeholder="請輸入您的單位名稱" value={unitOther} onChange={(e) => setUnitOther(e.target.value)} style={{ marginTop: '0.5rem' }} />
              )}
            </div>

            {/* 職稱 */}
            <div className="form-group">
              <label>職稱 <span className="required">*</span></label>
              <select required value={titleValue} onChange={(e) => setTitleValue(e.target.value)}>
                <option value="" disabled>請選擇您的職稱</option>
                <option value="A個管">A個管（社區整合型服務中心個案管理人員）</option>
                <option value="__other__">其他（自行填寫）</option>
              </select>
              {titleValue === '__other__' && (
                <input type="text" required placeholder="請輸入您的職稱" value={titleOther} onChange={(e) => setTitleOther(e.target.value)} style={{ marginTop: '0.5rem' }} />
              )}
            </div>

            {/* 手機號碼 */}
            <div className="form-group">
              <label>手機號碼 <span className="required">*</span></label>
              <input type="tel" required placeholder="例：0912-345-678" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>

            {/* Email */}
            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="example@mail.com（選填）" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            {/* 備註 */}
            <div className="form-group">
              <label>備註</label>
              <textarea placeholder="如有特殊需求或其他事項請在此說明（選填）" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>

            <button type="submit" className="btn-submit" disabled={submitting}>
              {submitting ? '送出中...' : '送出報名'}
            </button>
          </form>
        </section>
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-logos">
          <img src="/images/logo-sfaa.png" alt="衛福部社家署" />
          <img src="/images/logo-ptgov.png" alt="屏東縣政府" />
          <img src="/images/logo-ptrc.png" alt="屏東縣輔具資源中心" />
          <img src="/images/logo-lottery.png" alt="公益彩券" />
        </div>
        <p>
          主辦｜屏東縣政府社會處 ・ 委辦｜屏東縣輔具資源中心（屏中區／屏北區）<br />
          &copy; 2026 社團法人屏東縣輔具應用及身心健康促進協會
        </p>
      </footer>
    </>
  );
}
