'use client';

import Link from 'next/link';

export default function SuccessPage() {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #F7FAFA 0%, #E8F5F5 100%)',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '20px',
        padding: '3rem 2.5rem',
        maxWidth: '480px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 8px 30px rgba(13,115,119,0.1)',
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '0.5rem', animation: 'bounce 0.6s ease' }}>
          &#127881;
        </div>
        <div style={{
          width: '80px',
          height: '80px',
          background: 'var(--success)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
          animation: 'pop 0.5s ease',
        }}>
          <svg viewBox="0 0 24 24" style={{ width: '40px', height: '40px', stroke: '#fff', strokeWidth: 3, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' }}>
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h1 style={{ fontSize: '1.6rem', color: 'var(--text)', marginBottom: '0.5rem' }}>報名成功！</h1>
        <div style={{ fontSize: '1rem', color: 'var(--primary)', fontWeight: 600, marginBottom: '1.5rem' }}>
          【科技守護．智慧安居】教育訓練
        </div>
        <div style={{ fontSize: '0.95rem', color: 'var(--text-light)', lineHeight: 1.8, marginBottom: '2rem' }}>
          感謝您的報名！<br />
          我們已收到您的資料，活動當天請準時出席。<br />
          如需更改或取消報名，請聯繫以下窗口。
        </div>
        <div style={{
          background: '#F4F9F9',
          borderRadius: '12px',
          padding: '1rem 1.25rem',
          marginBottom: '2rem',
          textAlign: 'left',
        }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)', marginBottom: '0.5rem' }}>聯繫窗口</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', padding: '0.2rem 0' }}>
            <span style={{ fontWeight: 600 }}>屏中區</span>
            <span style={{ color: 'var(--text-light)' }}>(08) 789-9599 #22 陳社工</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', padding: '0.2rem 0' }}>
            <span style={{ fontWeight: 600 }}>屏北區</span>
            <span style={{ color: 'var(--text-light)' }}>(08) 736-5455 #24 孫社工</span>
          </div>
        </div>
        <Link href="/" style={{
          display: 'inline-block',
          padding: '0.75rem 2rem',
          background: 'var(--primary)',
          color: '#fff',
          border: 'none',
          borderRadius: '10px',
          fontSize: '1rem',
          fontWeight: 700,
          textDecoration: 'none',
          cursor: 'pointer',
        }}>
          返回報名頁面
        </Link>
      </div>

      <div style={{ marginTop: '2rem', fontSize: '0.75rem', color: 'var(--text-light)' }}>
        屏東縣輔具資源中心（屏中區／屏北區）
      </div>
    </div>
  );
}
