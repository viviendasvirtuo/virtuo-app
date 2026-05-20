'use client';
import { C } from './tokens';

interface TopbarProps {
  title: string;
  onMenuToggle: () => void;
}

export default function Topbar({ title, onMenuToggle }: TopbarProps) {
  return (
    <div style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: C.w,
      borderBottom: `1.5px solid ${C.bd}`,
      padding: '11px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 1px 4px rgba(30,77,183,.07)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={onMenuToggle}
          style={{
            background: C.b,
            color: '#fff',
            border: 'none',
            borderRadius: 9,
            width: 36,
            height: 36,
            cursor: 'pointer',
            fontSize: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
          aria-label="Toggle menu"
        >
          ☰
        </button>
        <span style={{
          fontFamily: "'Fraunces', serif",
          fontWeight: 700,
          fontSize: 18,
          color: C.g9,
        }}>{title}</span>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button style={{
          background: C.bl,
          color: C.b,
          border: `1.5px solid ${C.bd}`,
          borderRadius: 9,
          padding: '7px 14px',
          fontWeight: 700,
          fontSize: 13,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 5,
        }}>
          ⚡ Make
        </button>
        <button style={{
          background: C.b,
          color: '#fff',
          border: 'none',
          borderRadius: 9,
          padding: '7px 14px',
          fontWeight: 700,
          fontSize: 13,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 5,
        }}>
          + Piso
        </button>
      </div>
    </div>
  );
}
