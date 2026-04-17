'use client';

import { useState, useCallback } from 'react';
import { SESSIONS, MAX_PER_SESSION } from '@/lib/constants';

interface Submission {
  id: string;
  name: string;
  unit: string;
  title: string;
  phone: string;
  email: string;
  session: string;
  notes: string;
  submitted_at: string;
}

function formatTime(iso: string) {
  const d = new Date(iso);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${mm}/${dd} ${hh}:${mi}`;
}

export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [adminKey, setAdminKey] = useState('');
  const [allData, setAllData] = useState<Submission[]>([]);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());

  const loadData = useCallback(async (key: string) => {
    try {
      const res = await fetch(`/api/submissions?key=${encodeURIComponent(key)}`);
      if (res.status === 401) return null;
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch {
      return null;
    }
  }, []);

  async function doLogin() {
    const pw = password.trim();
    if (!pw) return;
    const data = await loadData(pw);
    if (data === null) {
      setLoginError(true);
      return;
    }
    setAdminKey(pw);
    setAllData(data);
    setLoggedIn(true);
    setLoginError(false);
  }

  async function refreshData() {
    const data = await loadData(adminKey);
    if (data) {
      setAllData(data);
      setCheckedIds(new Set());
    } else {
      alert('載入失敗，請稍後再試');
    }
  }

  function toggleFilter(session: string) {
    setActiveFilter((prev) => (prev === session ? null : session));
    setCheckedIds(new Set());
  }

  const filtered = activeFilter
    ? allData.filter((d) => d.session === activeFilter)
    : allData;

  const counts: Record<string, number> = {};
  allData.forEach((d) => {
    counts[d.session] = (counts[d.session] || 0) + 1;
  });

  function toggleCheck(id: string) {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll(checked: boolean) {
    if (checked) {
      setCheckedIds(new Set(filtered.map((d) => d.id)));
    } else {
      setCheckedIds(new Set());
    }
  }

  async function deleteSelected() {
    if (checkedIds.size === 0) return;
    if (!confirm(`確定要刪除這 ${checkedIds.size} 筆報名資料嗎？\n此操作無法復原！`)) return;

    try {
      const res = await fetch('/api/delete-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: adminKey, ids: Array.from(checkedIds) }),
      });
      const result = await res.json();
      if (res.ok) {
        alert(`已成功刪除 ${checkedIds.size} 筆資料`);
        await refreshData();
      } else {
        alert('刪除失敗：' + (result.error || '未知錯誤'));
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '未知錯誤';
      alert('刪除失敗：' + msg);
    }
  }

  function exportExcel() {
    import('xlsx').then((XLSX) => {
      const rows = filtered.map((d, i) => ({
        '序號': i + 1,
        '姓名': d.name,
        '服務單位': d.unit,
        '職稱': d.title,
        '手機': d.phone,
        'Email': d.email,
        '場次': d.session,
        '備註': d.notes,
        '報名時間': d.submitted_at ? formatTime(d.submitted_at) : '',
      }));

      const ws = XLSX.utils.json_to_sheet(rows);
      ws['!cols'] = [
        { wch: 5 }, { wch: 10 }, { wch: 20 }, { wch: 8 }, { wch: 14 },
        { wch: 25 }, { wch: 16 }, { wch: 15 }, { wch: 14 },
      ];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, '報名名單');
      const suffix = activeFilter ? activeFilter.replace(/[/（）]/g, '_') : '全部場次';
      XLSX.writeFile(wb, `報名名單_${suffix}.xlsx`);
    });
  }

  // Login overlay
  if (!loggedIn) {
    return (
      <div style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
      }}>
        <div style={{
          background: '#fff', borderRadius: '16px', padding: '2.5rem 2rem', width: '360px',
          textAlign: 'center', boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
        }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--primary)' }}>報名後台</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '1.25rem' }}>科技守護．智慧安居 教育訓練</p>
          <input
            type="password"
            placeholder="請輸入管理密碼"
            autoFocus
            value={password}
            onChange={(e) => { setPassword(e.target.value); setLoginError(false); }}
            onKeyDown={(e) => { if (e.key === 'Enter') doLogin(); }}
            style={{
              width: '100%', padding: '0.75rem 1rem', border: '1.5px solid var(--border)', borderRadius: '10px',
              fontSize: '1rem', textAlign: 'center', letterSpacing: '2px', marginBottom: '0.75rem',
              outline: 'none', fontFamily: 'inherit',
            }}
          />
          <button
            onClick={doLogin}
            style={{
              width: '100%', padding: '0.75rem', background: 'var(--primary)', color: '#fff',
              border: 'none', borderRadius: '10px', fontSize: '1rem', fontWeight: 700,
              fontFamily: 'inherit', cursor: 'pointer',
            }}
          >
            登入
          </button>
          {loginError && (
            <div style={{ color: 'var(--error)', fontSize: '0.85rem', marginTop: '0.5rem' }}>密碼錯誤，請重試</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        background: 'var(--primary)', color: '#fff', padding: '1.25rem 2rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <h1 style={{ fontSize: '1.15rem', fontWeight: 700 }}>【科技守護．智慧安居】報名管理</h1>
        <button
          onClick={refreshData}
          style={{
            background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff',
            padding: '0.4rem 1rem', borderRadius: '8px', fontSize: '0.85rem',
            fontFamily: 'inherit', cursor: 'pointer', fontWeight: 600,
          }}
        >
          &#8635; 重新整理
        </button>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '1.5rem', flex: 1 }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          {SESSIONS.map((s) => {
            const count = counts[s.value] || 0;
            const pct = Math.min(100, Math.round((count / MAX_PER_SESSION) * 100));
            const isActive = activeFilter === s.value;
            let fillColor = 'var(--primary)';
            if (pct >= 100) fillColor = 'var(--error)';
            else if (pct >= 70) fillColor = 'var(--warning)';

            return (
              <div
                key={s.value}
                onClick={() => toggleFilter(s.value)}
                style={{
                  background: 'var(--card)', borderRadius: '12px', padding: '1.25rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)', cursor: 'pointer',
                  border: isActive ? '2px solid var(--primary)' : '1px solid var(--border)',
                  boxSizing: 'border-box',
                }}
              >
                <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', fontWeight: 600, marginBottom: '0.5rem' }}>{s.value}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                  <span style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--primary)', lineHeight: 1 }}>{count}</span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>/ {MAX_PER_SESSION}</span>
                </div>
                <div style={{ marginTop: '0.6rem', height: '6px', background: '#E8F0F0', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: '3px', background: fillColor, width: `${pct}%`, transition: 'width 0.5s ease' }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>
            {activeFilter ? (
              <>
                顯示 <strong style={{ color: 'var(--text)' }}>{activeFilter}</strong>（{filtered.length} 人）
                <button
                  onClick={() => { setActiveFilter(null); setCheckedIds(new Set()); }}
                  style={{ marginLeft: '0.5rem', background: 'none', border: '1px solid var(--border)', color: 'var(--text-light)', padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  &#10005; 清除篩選
                </button>
              </>
            ) : (
              <>顯示 <strong style={{ color: 'var(--text)' }}>全部場次</strong>（共 {filtered.length} 人）</>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {checkedIds.size > 0 && (
              <button
                onClick={deleteSelected}
                style={{ background: 'var(--error)', color: '#fff', border: 'none', padding: '0.5rem 1.25rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer' }}
              >
                &#128465; 刪除勾選（{checkedIds.size}）
              </button>
            )}
            <button
              onClick={exportExcel}
              style={{ background: 'var(--accent)', color: '#fff', border: 'none', padding: '0.5rem 1.25rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              &#128229; 匯出 Excel
            </button>
          </div>
        </div>

        {/* Table */}
        <div style={{ background: 'var(--card)', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid var(--border)', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr>
                <th style={{ background: '#F7F9FB', padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 700, color: 'var(--text-light)', fontSize: '0.8rem', letterSpacing: '0.5px', borderBottom: '2px solid var(--border)', width: '36px' }}>
                  <input
                    type="checkbox"
                    checked={filtered.length > 0 && checkedIds.size === filtered.length}
                    onChange={(e) => toggleAll(e.target.checked)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                  />
                </th>
                {['#', '姓名', '服務單位', '職稱', '手機', 'Email', '場次', '備註', '報名時間'].map((h) => (
                  <th key={h} style={{ background: '#F7F9FB', padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 700, color: 'var(--text-light)', fontSize: '0.8rem', letterSpacing: '0.5px', borderBottom: '2px solid var(--border)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-light)' }}>
                    尚無報名資料
                  </td>
                </tr>
              ) : (
                filtered.map((d, i) => {
                  const isCenter = d.session?.includes('屏中區');
                  const badgeClass = isCenter ? 'center' : 'north';
                  const tdStyle: React.CSSProperties = { padding: '0.7rem 1rem', borderBottom: '1px solid var(--border)', verticalAlign: 'top' };
                  return (
                    <tr key={d.id}>
                      <td style={{ ...tdStyle, textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={checkedIds.has(d.id)}
                          onChange={() => toggleCheck(d.id)}
                          style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                        />
                      </td>
                      <td style={{ ...tdStyle, color: 'var(--text-light)', fontSize: '0.8rem', fontWeight: 600 }}>{i + 1}</td>
                      <td style={{ ...tdStyle, fontWeight: 700 }}>{d.name}</td>
                      <td style={tdStyle}>{d.unit}</td>
                      <td style={tdStyle}>{d.title}</td>
                      <td style={tdStyle}>{d.phone}</td>
                      <td style={tdStyle}>{d.email || <span style={{ color: '#ccc' }}>-</span>}</td>
                      <td style={tdStyle}>
                        <span className={`session-badge ${badgeClass}`}>{d.session}</span>
                      </td>
                      <td style={{ ...tdStyle, maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={d.notes}>
                        {d.notes || <span style={{ color: '#ccc' }}>-</span>}
                      </td>
                      <td style={{ ...tdStyle, fontSize: '0.8rem', color: 'var(--text-light)', whiteSpace: 'nowrap' }}>
                        {d.submitted_at ? formatTime(d.submitted_at) : '-'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
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
    </div>
  );
}
