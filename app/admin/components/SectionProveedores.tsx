import { C, card, cardHead, cardBody } from './tokens';

const PROVEEDORES = [
  {
    id: 'p1', nombre: 'Limpiezas Maresme SL', especialidad: 'Limpieza', contacto: 'info@maresme.com', telefono: '+34 932 XX XX XX',
    score: 10, maxScore: 10, estado: 'ACTIVO', color: C.g,
    metricas: [{ k: 'Respuesta', v: '< 2h' }, { k: 'Satisfacción', v: '10/10' }, { k: 'Trabajos', v: '24' }, { k: 'Incidencias', v: '0' }],
  },
  {
    id: 'p2', nombre: 'Pinturas Andres SL', especialidad: 'Pintura y reformas', contacto: 'andres@pinturas.com', telefono: '+34 931 XX XX XX',
    score: 0, maxScore: 10, estado: 'EN PROCESO', color: C.y,
    metricas: [{ k: 'Respuesta', v: 'Pendiente' }, { k: 'Satisfacción', v: '—' }, { k: 'Trabajos', v: '0' }, { k: 'Incidencias', v: '—' }],
  },
];

const SCORING_CRITERIOS = [
  { nombre: 'Velocidad de respuesta', peso: '25%' },
  { nombre: 'Calidad del trabajo', peso: '30%' },
  { nombre: 'Precio competitivo', peso: '20%' },
  { nombre: 'Fiabilidad horaria', peso: '15%' },
  { nombre: 'Comunicación', peso: '10%' },
];

const PENDIENTES = [
  { categoria: 'Electricista', urgencia: 'alta', color: C.r },
  { categoria: 'Fontanero', urgencia: 'alta', color: C.r },
  { categoria: 'Cerrajero', urgencia: 'media', color: C.y },
  { categoria: 'Montaje muebles', urgencia: 'baja', color: C.g },
];

export default function SectionProveedores() {
  return (
    <div>
      <style>{`@media(max-width:700px){.prov-grid{grid-template-columns:1fr!important}}`}</style>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 14 }}>
        {PROVEEDORES.map(p => (
          <div key={p.id} style={{ ...card, marginBottom: 0 }}>
            <div style={{ height: 3, background: p.color }} />
            <div style={{ padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 16, color: C.g9 }}>{p.nombre}</div>
                  <div style={{ fontSize: 12, color: C.g5, marginTop: 3 }}>🔧 {p.especialidad} · 📧 {p.contacto} · 📞 {p.telefono}</div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 24, color: p.score > 0 ? p.color : C.g5 }}>{p.score > 0 ? `${p.score}/10` : '—'}</div>
                    <div style={{ fontSize: 10, color: C.g5 }}>Score</div>
                  </div>
                  <span style={{ background: p.estado === 'ACTIVO' ? C.gl : C.yl, color: p.estado === 'ACTIVO' ? C.g : C.y, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 8 }}>{p.estado}</span>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {p.metricas.map((m, i) => (
                  <div key={i} style={{ background: C.g0, borderRadius: 8, padding: '8px 10px', textAlign: 'center', border: `1px solid ${C.bd}` }}>
                    <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 14, color: C.g9 }}>{m.v}</div>
                    <div style={{ fontSize: 10, color: C.g5, marginTop: 2 }}>{m.k}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="prov-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div style={card}>
          <div style={cardHead}>📊 Sistema de scoring</div>
          <div style={cardBody}>
            {SCORING_CRITERIOS.map((c, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < SCORING_CRITERIOS.length - 1 ? `1px solid ${C.g1}` : 'none', fontSize: 13 }}>
                <span style={{ color: C.g9, fontWeight: 500 }}>{c.nombre}</span>
                <span style={{ background: C.bl, color: C.b, fontWeight: 700, fontSize: 11, padding: '2px 8px', borderRadius: 6 }}>{c.peso}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={card}>
          <div style={cardHead}>⚠️ Categorías pendientes</div>
          <div style={cardBody}>
            <div style={{ marginBottom: 10, fontSize: 12.5, color: C.g5 }}>Necesitamos homologar proveedores en estas categorías:</div>
            {PENDIENTES.map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', background: C.g0, borderRadius: 8, marginBottom: 6, border: `1px solid ${C.bd}` }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.g9 }}>{p.categoria}</span>
                <span style={{ background: p.urgencia === 'alta' ? C.rl : p.urgencia === 'media' ? C.yl : C.gl, color: p.color, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6 }}>{p.urgencia}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
