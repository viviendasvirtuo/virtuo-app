import { C, card, cardHead, cardBody } from './tokens';

const ESCENARIOS = [
  { esc: 'A', nombre: 'Captación automatizada', trigger: 'Formulario web recibido', accion: 'Crear lead + enviar email SOL_03', sops: 'SOP01, SOP02', estado: 'ACTIVO', color: C.g },
  { esc: 'B', nombre: 'Gestión de inquilinos', trigger: 'Firma contrato en DocuSign', accion: 'Check-in workflow + WEL_02', sops: 'SOP08, SOP09', estado: 'ACTIVO', color: C.g },
  { esc: 'C', nombre: 'Incidencias', trigger: 'Formulario incidencia enviado', accion: 'Crear ticket + notificar proveedor', sops: 'SOP11', estado: 'PENDIENTE', color: C.y },
  { esc: 'D', nombre: 'Control financiero', trigger: 'Día 1 de cada mes', accion: 'Generar informe P&L + enviar', sops: 'SOP13', estado: 'ACTIVO', color: C.g },
  { esc: 'E', nombre: 'Feedback y NPS', trigger: 'Check-out completado', accion: 'Enviar FDB_24 + actualizar NPS', sops: 'SOP12, SOP15', estado: 'ACTIVO', color: C.g },
];

const PIPELINE_STAGES = [
  'CAPTACION_RECIBIDA', 'EMAIL_CALENDLY', 'VISITA_AGENDADA', 'VISITA_OK',
  'DATOS_TECNICOS', 'PROPUESTA_ENVIADA', 'FIRMA', 'ONBOARDING',
];

const STAGE_SHORT: Record<string, string> = {
  CAPTACION_RECIBIDA: 'Captación', EMAIL_CALENDLY: 'Email', VISITA_AGENDADA: 'Visita ag.',
  VISITA_OK: 'Visita OK', DATOS_TECNICOS: 'Datos', PROPUESTA_ENVIADA: 'Propuesta',
  FIRMA: 'Firma', ONBOARDING: 'Onboarding',
};

export default function SectionMake() {
  return (
    <div>
      <div style={card}>
        <div style={cardHead}>⚡ Escenarios Make · A–E</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: C.g0 }}>
                {['Esc.', 'Nombre', 'Trigger', 'Acción', 'SOPs', 'Estado'].map(h => (
                  <th key={h} style={{ padding: '9px 14px', textAlign: 'left', color: C.g5, fontWeight: 600, borderBottom: `1px solid ${C.bd}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ESCENARIOS.map((e, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${C.g1}` }}>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: C.bl, color: C.b, fontWeight: 800, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{e.esc}</div>
                  </td>
                  <td style={{ padding: '10px 14px', fontWeight: 700, color: C.g9 }}>{e.nombre}</td>
                  <td style={{ padding: '10px 14px', color: C.g5, fontSize: 12 }}>{e.trigger}</td>
                  <td style={{ padding: '10px 14px', color: C.g9, fontSize: 12 }}>{e.accion}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: 11, background: C.g1, color: C.g5, padding: '2px 6px', borderRadius: 5 }}>{e.sops}</span>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ background: e.estado === 'ACTIVO' ? C.gl : C.yl, color: e.estado === 'ACTIVO' ? C.g : C.y, fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 7 }}>{e.estado}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={card}>
        <div style={cardHead}>🔄 Pipeline estados · Flujo Make</div>
        <div style={{ padding: '16px', overflowX: 'auto' }}>
          <div style={{ display: 'flex', gap: 0, minWidth: 600 }}>
            {PIPELINE_STAGES.map((s, i) => (
              <div key={s} style={{ flex: 1, textAlign: 'center', position: 'relative' }}>
                <div style={{
                  width: 30, height: 30, borderRadius: '50%', margin: '0 auto 6px',
                  background: C.g, color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 11, zIndex: 1, position: 'relative',
                }}>
                  {i + 1}
                </div>
                {i < PIPELINE_STAGES.length - 1 && (
                  <div style={{ position: 'absolute', top: 14, left: '50%', right: '-50%', height: 2, background: C.g, zIndex: 0 }} />
                )}
                <div style={{ fontSize: 9.5, color: C.g5, fontWeight: 600, lineHeight: 1.2 }}>{STAGE_SHORT[s]}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ padding: '0 16px 14px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {ESCENARIOS.map(e => (
            <div key={e.esc} style={{ background: e.estado === 'ACTIVO' ? C.gl : C.yl, color: e.estado === 'ACTIVO' ? C.g : C.y, fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 8 }}>
              Esc. {e.esc} · {e.estado}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
