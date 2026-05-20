import type React from 'react';

export const C = {
  b:  '#1E4DB7', b2: '#2E86DE',
  g:  '#27AE60', r:  '#E74C3C',
  y:  '#F39C12', p:  '#8E44AD',
  bl: '#EBF3FF', gl: '#E8F8EF',
  rl: '#FDECEA', yl: '#FEF9EC',
  pl: '#F5EEF8', bd: '#E2E6EF',
  g0: '#F8F9FC', g1: '#F0F2F7',
  g5: '#8896B0', g9: '#1A253D',
  w:  '#ffffff',
} as const;

export function pill(type: 'g' | 'b' | 'r' | 'y' | 'p' | 'gr'): { bg: string; color: string } {
  const map: Record<string, { bg: string; color: string }> = {
    g:  { bg: C.gl, color: C.g },
    b:  { bg: C.bl, color: C.b },
    r:  { bg: C.rl, color: C.r },
    y:  { bg: C.yl, color: C.y },
    p:  { bg: C.pl, color: C.p },
    gr: { bg: C.g1, color: C.g5 },
  };
  return map[type];
}

export const card: React.CSSProperties = {
  background: '#fff',
  border: `1.5px solid #E2E6EF`,
  borderRadius: 14,
  overflow: 'hidden',
  boxShadow: '0 1px 3px rgba(30,77,183,.06)',
  marginBottom: 14,
};

export const cardHead: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '13px 16px 10px',
  borderBottom: '1px solid #F0F2F7',
  fontFamily: "'Fraunces', serif",
  fontWeight: 700,
  fontSize: 14,
};

export const cardBody: React.CSSProperties = {
  padding: '13px 16px',
};
