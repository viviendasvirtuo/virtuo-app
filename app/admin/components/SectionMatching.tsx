import { C, card, cardHead, cardBody } from './tokens';

const CANDIDATOS = [
  { nombre: 'Alejandro F.', score: 92, color: C.g, detalles: ['Presupuesto: 650€ ✅', 'Grupo compatible ✅', 'Sin mascotas ✅', 'Duración 12m ✅', 'Horario diurno ✅'] },
  { nombre: 'María G.', score: 74, color: C.y, detalles: ['Presupuesto: 600€ ⚠️', 'Grupo compatible ✅', '1 mascota ⚠️', 'Duración 6m ⚠️', 'Horario mixto ✅'] },
];

const CRITERIOS = [
  { nombre: 'Presupuesto', peso: 30, color: C.b },
  { nombre: 'Compatibilidad de grupo', peso: 25, color: C.p },
  { nombre: 'Horario', peso: 20, color: C.g },
  { nombre: 'Mascotas', peso: 15, color: C.y },
  { nombre: 'Duración contrato', peso: 10, color: C.r },
];

export default function SectionMatching() {
  return (
    <div>
      <style>{`@media(max-width:700px){.match-grid{grid-template-columns:1fr!important}}`}</style>
      <div style={{ marginBottom: 14 }}>
        <div style={{ ...card, marginBottom: 0 }}>
          <div style={cardHead}>🤝 Matching · HAB5 Sants 10</div>
          <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }} className="match-grid">
            {CANDIDATOS.map((c, i) => (
              <div key={i} style={{ background: C.g0, borderRadius: 12, padding: 16, border: `1.5px solid ${C.bd}` }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: C.g9 }}>{c.nombre}</div>
                    <div style={{ fontSize: 11, color: C.g5, marginTop: 2 }}>Candidato HAB5</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 28, color: c.color }}>{c.score}%</div>
                    <div style={{ fontSize: 10, color: C.g5 }}>Match score</div>
                  </div>
                </div>
                <div style={{ height: 6, background: C.g1, borderRadius: 3, marginBottom: 12 }}>
                  <div style={{ height: '100%', width: `${c.score}%`, background: c.color, borderRadius: 3 }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {c.detalles.map((d, j) => (
                    <div key={j} style={{ fontSize: 12, color: C.g9, display: 'flex', alignItems: 'center', gap: 6 }}>
                      {d}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="match-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div style={card}>
          <div style={cardHead}>⚖️ Pesos de criterios</div>
          <div style={cardBody}>
            {CRITERIOS.map((c, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, fontWeight: 600, color: C.g9, marginBottom: 4 }}>
                  <span>{c.nombre}</span><span style={{ color: c.color }}>{c.peso}%</span>
                </div>
                <div style={{ height: 5, background: C.g1, borderRadius: 3 }}>
                  <div style={{ height: '100%', width: `${c.peso}%`, background: c.color, borderRadius: 3 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ ...card, marginBottom: 0 }}>
          <div style={cardHead}>🤖 Recomendación IA</div>
          <div style={cardBody}>
            <div style={{ background: C.gl, border: `1.5px solid ${C.g}`, borderRadius: 10, padding: 14, marginBottom: 12 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: C.g, marginBottom: 6 }}>✅ Candidato recomendado: Alejandro F.</div>
              <div style={{ fontSize: 12.5, color: C.g9 }}>Score 92% — Alta compatibilidad con el grupo actual. Presupuesto ajustado, sin mascotas, contrato larga duración. Perfil ideal para integración en comunidad.</div>
            </div>
            <div style={{ background: C.yl, border: `1.5px solid ${C.y}`, borderRadius: 10, padding: 14 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: C.y, marginBottom: 6 }}>⚠️ Alternativa: María G.</div>
              <div style={{ fontSize: 12.5, color: C.g9 }}>Score 74% — Viable pero con puntos a negociar: presupuesto (-50€), mascota y duración corta. Requiere conversación previa sobre convivencia.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
