import { C, card, cardHead, cardBody } from './tokens';

const STAGES = [
  'CAPTACION_RECIBIDA', 'EMAIL_CALENDLY', 'VISITA_AGENDADA', 'VISITA_OK',
  'DATOS_TECNICOS', 'PROPUESTA_ENVIADA', 'FIRMA', 'ONBOARDING',
];

const STAGE_LABELS: Record<string, string> = {
  CAPTACION_RECIBIDA: 'Captación', EMAIL_CALENDLY: 'Email/Calendly',
  VISITA_AGENDADA: 'Visita agendada', VISITA_OK: 'Visita OK',
  DATOS_TECNICOS: 'Datos técnicos', PROPUESTA_ENVIADA: 'Propuesta',
  FIRMA: 'Firma', ONBOARDING: 'Onboarding',
};

const OWNERS = [
  { piso: 'Sants 10', propietario: 'Javier M.', etapa: 'FIRMA', pisos: 6 },
  { piso: 'Plaza de Palau', propietario: 'Ana B.', etapa: 'ONBOARDING', pisos: 4 },
  { piso: 'Bulevar Pirineus', propietario: 'Luis K.', etapa: 'PROPUESTA_ENVIADA', pisos: 5 },
  { piso: 'Gracia Centro', propietario: 'Marta S.', etapa: 'VISITA_OK', pisos: 3 },
];

const CONVERSION = [
  { stage: 'Captación → Email', pct: 85 }, { stage: 'Email → Visita', pct: 60 },
  { stage: 'Visita → Propuesta', pct: 70 }, { stage: 'Propuesta → Firma', pct: 55 },
];

const FUENTES = [
  { name: 'Idealista', pct: 40, color: C.b },
  { name: 'Referidos', pct: 30, color: C.g },
  { name: 'Web propia', pct: 20, color: C.y },
  { name: 'Instagram', pct: 10, color: C.p },
];

const CURRENT_STAGE = 4;

export default function SectionPipeline() {
  return (
    <div>
      <style>{`@media(max-width:700px){.pipe-grid{grid-template-columns:1fr!important}}`}</style>
      <div style={card}>
        <div style={cardHead}>🎯 Pipeline CRM · Etapas</div>
        <div style={{ padding: '16px', overflowX: 'auto' }}>
          <div style={{ display: 'flex', gap: 0, minWidth: 600 }}>
            {STAGES.map((s, i) => {
              const isPast = i < CURRENT_STAGE;
              const isCurrent = i === CURRENT_STAGE;
              return (
                <div key={s} style={{ flex: 1, textAlign: 'center', position: 'relative' }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', margin: '0 auto 6px',
                    background: isCurrent ? C.b : isPast ? C.g : C.g1,
                    color: isCurrent || isPast ? '#fff' : C.g5,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 11, zIndex: 1, position: 'relative',
                  }}>{i + 1}</div>
                  {i < STAGES.length - 1 && (
                    <div style={{
                      position: 'absolute', top: 13, left: '50%', right: '-50%', height: 2,
                      background: isPast ? C.g : C.g1, zIndex: 0,
                    }} />
                  )}
                  <div style={{ fontSize: 9.5, color: isCurrent ? C.b : isPast ? C.g : C.g5, fontWeight: isCurrent ? 700 : 500, lineHeight: 1.2 }}>{STAGE_LABELS[s]}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div style={card}>
        <div style={cardHead}>🏘️ Propietarios en pipeline</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: C.g0 }}>
                {['Piso', 'Propietario', 'Habitaciones', 'Etapa actual'].map(h => (
                  <th key={h} style={{ padding: '9px 14px', textAlign: 'left', color: C.g5, fontWeight: 600, borderBottom: `1px solid ${C.bd}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {OWNERS.map((o, i) => {
                const idx = STAGES.indexOf(o.etapa);
                const isLate = idx >= 6;
                return (
                  <tr key={i} style={{ borderBottom: `1px solid ${C.g1}` }}>
                    <td style={{ padding: '9px 14px', fontWeight: 700, color: C.g9 }}>{o.piso}</td>
                    <td style={{ padding: '9px 14px', color: C.g5 }}>{o.propietario}</td>
                    <td style={{ padding: '9px 14px', color: C.g9 }}>{o.pisos}</td>
                    <td style={{ padding: '9px 14px' }}>
                      <span style={{ background: isLate ? C.gl : C.bl, color: isLate ? C.g : C.b, fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 7 }}>{STAGE_LABELS[o.etapa]}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="pipe-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div style={card}>
          <div style={cardHead}>📊 Conversión por etapa</div>
          <div style={cardBody}>
            {CONVERSION.map((c, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, fontWeight: 600, color: C.g9, marginBottom: 4 }}>
                  <span>{c.stage}</span><span>{c.pct}%</span>
                </div>
                <div style={{ height: 6, background: C.g1, borderRadius: 3 }}>
                  <div style={{ height: '100%', width: `${c.pct}%`, background: c.pct >= 70 ? C.g : c.pct >= 50 ? C.y : C.r, borderRadius: 3 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={card}>
          <div style={cardHead}>📡 Fuentes de captación</div>
          <div style={cardBody}>
            {FUENTES.map((f, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, fontWeight: 600, color: C.g9, marginBottom: 4 }}>
                  <span>{f.name}</span><span>{f.pct}%</span>
                </div>
                <div style={{ height: 6, background: C.g1, borderRadius: 3 }}>
                  <div style={{ height: '100%', width: `${f.pct}%`, background: f.color, borderRadius: 3 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
