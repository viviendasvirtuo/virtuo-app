'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { C, card, cardHead, cardBody } from './tokens';

interface MesData {
  mes: string;
  ingresos: number;
  gastos: number;
  beneficio: number;
}

const STATIC_MESES: MesData[] = [
  { mes: 'Ene 2026', ingresos: 4050, gastos: 2180, beneficio: 1870 },
  { mes: 'Feb 2026', ingresos: 4050, gastos: 2030, beneficio: 2020 },
  { mes: 'Mar 2026', ingresos: 4050, gastos: 2250, beneficio: 1800 },
];

const GASTOS_BREAKDOWN = [
  { cat: 'Alquiler propietarios', val: 1600, color: C.b },
  { cat: 'Limpieza', val: 240, color: C.p },
  { cat: 'Suministros', val: 200, color: C.y },
  { cat: 'Mantenimiento', val: 80, color: C.g },
  { cat: 'Gestión', val: 50, color: C.g5 },
];

const INGRESOS_HAB = [
  { hab: 'HAB1', inquilino: 'Alejandro F.', importe: 650, estado: 'Pagado' },
  { hab: 'HAB2', inquilino: 'María G.', importe: 650, estado: 'Pagado' },
  { hab: 'HAB3', inquilino: 'Jorge M.', importe: 650, estado: 'Pagado' },
  { hab: 'HAB4', inquilino: 'Sara L.', importe: 650, estado: 'Pagado' },
  { hab: 'HAB5', inquilino: 'Libre', importe: 0, estado: 'Libre' },
  { hab: 'HAB6', inquilino: 'Libre', importe: 0, estado: 'Libre' },
];

export default function SectionFinanzas() {
  const [meses, setMeses] = useState<MesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMes, setSelectedMes] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const sb = createClient();
        const { data, error } = await sb.from('transacciones').select('*').order('fecha', { ascending: false }).limit(50);
        if (error || !data || data.length === 0) throw new Error('no data');
        setMeses(STATIC_MESES);
      } catch {
        setMeses(STATIC_MESES);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const totalIngresos = meses.reduce((a: number, m: MesData) => a + m.ingresos, 0);
  const totalGastos = meses.reduce((a: number, m: MesData) => a + m.gastos, 0);
  const totalBeneficio = meses.reduce((a: number, m: MesData) => a + m.beneficio, 0);
  const maxVal = Math.max(...meses.map((m: MesData) => Math.max(m.ingresos, m.gastos)));

  if (loading) return (
    <div>
      {[1, 2, 3].map(i => <div key={i} style={{ background: C.g1, borderRadius: 10, height: 80, marginBottom: 12 }} />)}
    </div>
  );

  return (
    <div>
      <style>{`@media(max-width:700px){.fin-kpi{grid-template-columns:1fr 1fr!important}.fin-grid{grid-template-columns:1fr!important}}`}</style>
      <div className="fin-kpi" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
        {[
          { label: 'Ingresos totales', val: `${totalIngresos.toLocaleString()}€`, color: C.g, icon: '📈' },
          { label: 'Gastos totales', val: `${totalGastos.toLocaleString()}€`, color: C.r, icon: '📉' },
          { label: 'Beneficio neto', val: `${totalBeneficio.toLocaleString()}€`, color: C.b, icon: '💰' },
          { label: 'Reforma pendiente', val: '3.000€', color: C.y, icon: '🔧' },
        ].map((k, i) => (
          <div key={i} style={{ ...card, marginBottom: 0, position: 'relative', overflow: 'hidden' }}>
            <div style={{ height: 3, background: k.color, position: 'absolute', top: 0, left: 0, right: 0 }} />
            <div style={{ padding: '14px 16px 12px' }}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>{k.icon}</div>
              <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 22, color: C.g9 }}>{k.val}</div>
              <div style={{ fontSize: 11, color: C.g5 }}>{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="fin-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        <div style={card}>
          <div style={cardHead}>📅 P&L Mensual</div>
          <div style={cardBody}>
            {meses.map((m: MesData, i: number) => (
              <div
                key={i}
                onClick={() => setSelectedMes(i)}
                style={{ padding: '10px 12px', borderRadius: 9, marginBottom: 6, cursor: 'pointer', background: selectedMes === i ? C.bl : C.g0, border: `1.5px solid ${selectedMes === i ? C.b : C.bd}` }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13, fontWeight: 600, color: C.g9 }}>
                  <span>{m.mes}</span>
                  <span style={{ color: m.beneficio >= 0 ? C.g : C.r }}>{m.beneficio >= 0 ? '+' : ''}{m.beneficio}€</span>
                </div>
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  <div style={{ flex: m.ingresos / maxVal, height: 6, background: C.g, borderRadius: 3 }} />
                  <div style={{ flex: m.gastos / maxVal, height: 6, background: C.r, borderRadius: 3 }} />
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 4, fontSize: 11, color: C.g5 }}>
                  <span style={{ color: C.g }}>▲ {m.ingresos}€</span>
                  <span style={{ color: C.r }}>▼ {m.gastos}€</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={card}>
          <div style={cardHead}>🔍 Desglose gastos</div>
          <div style={cardBody}>
            {GASTOS_BREAKDOWN.map((g, i) => {
              const total = GASTOS_BREAKDOWN.reduce((a, x) => a + x.val, 0);
              const pct = Math.round((g.val / total) * 100);
              return (
                <div key={i} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, fontWeight: 600, color: C.g9, marginBottom: 4 }}>
                    <span>{g.cat}</span>
                    <span style={{ color: C.g5 }}>{g.val}€ · {pct}%</span>
                  </div>
                  <div style={{ height: 5, background: C.g1, borderRadius: 3 }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: g.color, borderRadius: 3 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div style={card}>
        <div style={cardHead}>🏠 Ingresos por habitación · Sants 10</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: C.g0 }}>
                {['Habitación', 'Inquilino', 'Importe', 'Estado'].map(h => (
                  <th key={h} style={{ padding: '9px 14px', textAlign: 'left', color: C.g5, fontWeight: 600, borderBottom: `1px solid ${C.bd}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {INGRESOS_HAB.map((row, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${C.g1}` }}>
                  <td style={{ padding: '9px 14px', fontWeight: 700, color: C.b }}>{row.hab}</td>
                  <td style={{ padding: '9px 14px', color: C.g9 }}>{row.inquilino}</td>
                  <td style={{ padding: '9px 14px', fontFamily: "'Fraunces', serif", fontWeight: 700, color: row.importe > 0 ? C.g9 : C.g5 }}>{row.importe > 0 ? `${row.importe}€` : '—'}</td>
                  <td style={{ padding: '9px 14px' }}>
                    <span style={{ background: row.estado === 'Pagado' ? C.gl : C.g1, color: row.estado === 'Pagado' ? C.g : C.g5, fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 7 }}>{row.estado}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
