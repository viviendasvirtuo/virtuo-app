'use client';
import { useState } from 'react';
import { C, card, cardHead, cardBody } from './tokens';

const CHECKIN_ITEMS = [
  'Entrega 2 copias de llaves',
  'Fotos habitación firmadas',
  'Inventario CHK_11 completado',
  'Alta WhatsApp del piso',
  'HUM_27 bienvenida enviado',
  'Fianza recibida y registrada',
];

const CHECKOUT_ITEMS = [
  'Aviso 30 días antes · CIE_22',
  'Recogida de llaves',
  'Fotos comparativas check-in/out',
  'Revisión inventario',
  'Devolución fianza si OK',
  'FDB_24 · Encuesta feedback',
];

const MOVIMIENTOS = [
  { tipo: 'CHECK-IN', icon: '🔑', hab: 'HAB5 · Sants 10', inquilino: 'Alejandro F.', fecha: '22 May 2026', color: C.g },
  { tipo: 'CHECK-OUT', icon: '🚪', hab: 'HAB3 · Pirineus', inquilino: 'Carlos R.', fecha: '31 May 2026', color: C.r },
  { tipo: 'CHECK-IN', icon: '🔑', hab: 'HAB2 · Palau', inquilino: 'Por asignar', fecha: '01 Jun 2026', color: C.g },
];

export default function SectionCheckins() {
  const [checkinDone, setCheckinDone] = useState<boolean[]>(new Array(CHECKIN_ITEMS.length).fill(false));
  const [checkoutDone, setCheckoutDone] = useState<boolean[]>(new Array(CHECKOUT_ITEMS.length).fill(false));

  const toggleIn = (i: number) => setCheckinDone(prev => prev.map((v, j) => j === i ? !v : v));
  const toggleOut = (i: number) => setCheckoutDone(prev => prev.map((v, j) => j === i ? !v : v));

  const inDone = checkinDone.filter(Boolean).length;
  const outDone = checkoutDone.filter(Boolean).length;

  return (
    <div>
      <style>{`@media(max-width:700px){.chk-grid{grid-template-columns:1fr!important}}`}</style>
      <div className="chk-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        <div style={card}>
          <div style={cardHead}>
            🔑 Checklist Check-in
            <span style={{ background: inDone === CHECKIN_ITEMS.length ? C.gl : C.yl, color: inDone === CHECKIN_ITEMS.length ? C.g : C.y, fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 7 }}>{inDone}/{CHECKIN_ITEMS.length}</span>
          </div>
          <div style={cardBody}>
            <div style={{ height: 4, background: C.g1, borderRadius: 3, marginBottom: 14 }}>
              <div style={{ height: '100%', width: `${(inDone / CHECKIN_ITEMS.length) * 100}%`, background: C.g, borderRadius: 3, transition: 'width .3s' }} />
            </div>
            {CHECKIN_ITEMS.map((item, i) => (
              <div
                key={i}
                onClick={() => toggleIn(i)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: i < CHECKIN_ITEMS.length - 1 ? `1px solid ${C.g1}` : 'none', cursor: 'pointer' }}
              >
                <div style={{
                  width: 18, height: 18, borderRadius: 4, border: `2px solid ${checkinDone[i] ? C.g : C.bd}`,
                  background: checkinDone[i] ? C.g : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  {checkinDone[i] && <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>✓</span>}
                </div>
                <span style={{ fontSize: 13, color: checkinDone[i] ? C.g5 : C.g9, textDecoration: checkinDone[i] ? 'line-through' : 'none' }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={card}>
          <div style={cardHead}>
            🚪 Checklist Check-out
            <span style={{ background: outDone === CHECKOUT_ITEMS.length ? C.gl : C.yl, color: outDone === CHECKOUT_ITEMS.length ? C.g : C.y, fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 7 }}>{outDone}/{CHECKOUT_ITEMS.length}</span>
          </div>
          <div style={cardBody}>
            <div style={{ height: 4, background: C.g1, borderRadius: 3, marginBottom: 14 }}>
              <div style={{ height: '100%', width: `${(outDone / CHECKOUT_ITEMS.length) * 100}%`, background: C.r, borderRadius: 3, transition: 'width .3s' }} />
            </div>
            {CHECKOUT_ITEMS.map((item, i) => (
              <div
                key={i}
                onClick={() => toggleOut(i)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: i < CHECKOUT_ITEMS.length - 1 ? `1px solid ${C.g1}` : 'none', cursor: 'pointer' }}
              >
                <div style={{
                  width: 18, height: 18, borderRadius: 4, border: `2px solid ${checkoutDone[i] ? C.r : C.bd}`,
                  background: checkoutDone[i] ? C.r : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  {checkoutDone[i] && <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>✓</span>}
                </div>
                <span style={{ fontSize: 13, color: checkoutDone[i] ? C.g5 : C.g9, textDecoration: checkoutDone[i] ? 'line-through' : 'none' }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={card}>
        <div style={cardHead}>📅 Próximos movimientos</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: C.g0 }}>
                {['Tipo', 'Habitación', 'Inquilino', 'Fecha'].map(h => (
                  <th key={h} style={{ padding: '9px 14px', textAlign: 'left', color: C.g5, fontWeight: 600, borderBottom: `1px solid ${C.bd}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOVIMIENTOS.map((m, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${C.g1}` }}>
                  <td style={{ padding: '9px 14px' }}>
                    <span style={{ background: m.tipo === 'CHECK-IN' ? C.gl : C.rl, color: m.color, fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 7 }}>{m.icon} {m.tipo}</span>
                  </td>
                  <td style={{ padding: '9px 14px', fontWeight: 600, color: C.g9 }}>{m.hab}</td>
                  <td style={{ padding: '9px 14px', color: C.g5 }}>{m.inquilino}</td>
                  <td style={{ padding: '9px 14px', fontFamily: "'Fraunces', serif", fontWeight: 700, color: C.g9 }}>{m.fecha}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
