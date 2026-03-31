import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fafafa',
          fontSize: 48,
          fontWeight: 700,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <span style={{ fontSize: 72 }}>🧄</span>
          <span>AI 导航</span>
        </div>
        <div style={{ fontSize: 24, color: '#666', fontWeight: 400 }}>
          发现最好的 AI 工具
        </div>
        <div style={{ fontSize: 20, color: '#999', fontWeight: 400, marginTop: 16 }}>
          2500+ AI 工具 · 中文介绍 · 持续更新
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
