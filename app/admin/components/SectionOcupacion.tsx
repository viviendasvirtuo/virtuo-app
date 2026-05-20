import { C, card, cardHead, cardBody } from './tokens';

const PISOS = [
  { name: 'Sants 10', pct: 80, ocp: 5, total: 6 },
  { name: 'Bulevar Pirineus', pct: 70, ocp: 4, total: 5 },
  { name: 'Plaza de Palau', pct: 0, ocp: 0, total: 4 },
];

const EVOLUCION = [
  { mes: 'Oct 25', pct: 60 }, { mes: 'Nov 25', pct: 70 }, { mes: 'Dic 25', pct: 65 },
  { mes: 'Ene 26', pct: 73 }, { mes: 'Feb 26', pct: 75 }, { mes: 'Mar 26', pct: 75 },
];

const TARGETS = [
  { kpi: 'Ocupación global', target: '80%', actual: '75%', diff: '-5%', ok: false },
  { kpi: 'Ticket medio', target: '700€', actual: '750€', diff: '+50€', ok: true },
  { kpi: 'Días vacante', target: '<15d', actual: '18d', diff: '+3d', ok: false },
  { kpi: 'NPS inquilinos', target: '4.5', actual: '4.7', diff: '+0.2', ok: true },
  { kpi: 'Churn mensual', target: '<10%', actual: '8%', diff: '-2%', ok: true },
];

export default function SectionOcupacion() {
  return (
    <div>
      <style>{`@media(max-width:700px){.ocp-kpi{grid-template-columns:1fr 1fr!important}.ocp-grid{grid-template-columns:1fr!important}}`}</style>

      <div className="ocp-kpi" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
        {[
          { label: 'Ocupación global', val: '75%', color: C.g, icon: '📊', sub: 'de 15 unidades' },
          { label: 'Ticket medio', val: '750€', color: C.b, icon: '💰', sub: 'por habitación/mes' },
          { label: 'Días vacante media', val: '18d', color: C.y, icon: '📅', sub: 'entre contratos' },
          { label: 'NPS inquilinos', val: '4.7', color: C.p, icon: '⭐', sub: 'satisfacción media' },
          { label: 'Churn mensual', val: '8%', color: C.r, icon: '📉', sub: 'rotación mensual' },
        ].map((k, i) => (
          <div key={i} style={{ ...card, marginBottom: 0, position: 'relative', overflow: 'hidden' }}>
            <div style={{ height: 3, background: k.color, position: 'absolute', top: 0, left: 0, right: 0 }} />
            <div style={{ padding: '14px 14px 12px' }}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>{k.icon}</div>
              <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 24, color: C.g9 }}>{k.val}</div>
              <div style={{ fontSize: 11, color: C.g5, marginTop: 2 }}>{k.label}</div>
              <div style={{ fontSize: 10, color: C.g5, marginTop: 1 }}>{k.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="ocp-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        <div style={card}>
          <div style={cardHead}>🏘️ Ocupación por piso</div>
          <div style={cardBody}>
            {PISOS.map(p => (
              <div key={p.name} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, color: C.g9, marginBottom: 5 }}>
                  <span>{p.name}</span>
                  <span style={{ color: C.g5 }}>{p.ocp}/{p.total} · {p.pct}%</span>
                </div>
                <div style={{ height: 8, background: C.g1, borderRadius: 4 }}>
                  <div style={{ height: '100%', width: `${p.pct}%`, background: p.pct >= 75 ? C.g : p.pct > 0 ? C.y : C.rl, borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={card}>
          <div style={cardHead}>📈 Evolución mensual</div>
          <div style={cardBody}>
            {EVOLUCION.map(e => (
              <div key={e.mes} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, fontWeight: 600, color: C.g9, marginBottom: 4 }}>
                  <span>{e.mes}</span><span>{e.pct}%</span>
                </div>
                <div style={{ height: 6, background: C.g1, borderRadius: 3 }}>
                  <div style={{ height: '100%', width: `${e.pct}%`, background: C.b2, borderRadius: 3 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={card}>
        <div style={cardHead}>🎯 Targets vs Actuals</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: C.g0 }}>
                {['KPI', 'Target', 'Actual', 'Diferencia', 'Estado'].map(h => (
                  <th key={h} style={{ padding: '9px 14px', textAlign: 'left', color: C.g5, fontWeight: 600, borderBottom: `1px solid ${C.bd}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TARGETS.map((row, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${C.g1}` }}>
                  <td style={{ padding: '9px 14px', fontWeight: 600, color: C.g9 }}>{row.kpi}</td>
                  <td style={{ padding: '9px 14px', color: C.g5 }}>{row.target}</td>
                  <td style={{ padding: '9px 14px', fontFamily: "'Fraunces', serif", fontWeight: 700, color: C.g9 }}>{row.actual}</td>
                  <td style={{ padding: '9px 14px', color: row.ok ? C.g : C.r, fontWeight: 700 }}>{row.diff}</td>
                  <td style={{ padding: '9px 14px' }}>
                    <span style={{ background: row.ok ? C.gl : C.rl, color: row.ok ? C.g : C.r, fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 7 }}>{row.ok ? '✅ OK' : '⚠️ Off'}</span>
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
