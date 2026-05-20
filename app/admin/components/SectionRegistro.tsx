import { C, cardHead } from './tokens';

interface RegistroRow {
  id: string;
  accion: string;
  tipo: 'Detectado' | 'Duplicado';
  canal: 'email' | 'whatsapp';
  fecha: string;
}

const ROWS: RegistroRow[] = [
  { id: 'REG_001', accion: 'Nuevo lead captado — Alejandro F.', tipo: 'Detectado', canal: 'email', fecha: '2026-04-20 09:14' },
  { id: 'REG_002', accion: 'Lead duplicado — María G. (2ª vez)', tipo: 'Duplicado', canal: 'whatsapp', fecha: '2026-04-20 11:32' },
  { id: 'REG_003', accion: 'Visita agendada — Jorge M.', tipo: 'Detectado', canal: 'email', fecha: '2026-04-19 16:05' },
  { id: 'REG_004', accion: 'Firma contrato — Sara L.', tipo: 'Detectado', canal: 'email', fecha: '2026-04-18 10:22' },
  { id: 'REG_005', accion: 'Formulario duplicado — Carlos R.', tipo: 'Duplicado', canal: 'email', fecha: '2026-04-17 14:50' },
  { id: 'REG_006', accion: 'Onboarding completado — Ana B.', tipo: 'Detectado', canal: 'whatsapp', fecha: '2026-04-16 09:00' },
  { id: 'REG_007', accion: 'Propuesta enviada — Luis K.', tipo: 'Detectado', canal: 'email', fecha: '2026-04-15 18:30' },
  { id: 'REG_008', accion: 'Mensaje duplicado — Pedro M.', tipo: 'Duplicado', canal: 'whatsapp', fecha: '2026-04-14 12:10' },
];

export default function SectionRegistro() {
  const detectados = ROWS.filter(r => r.tipo === 'Detectado').length;
  const duplicados = ROWS.filter(r => r.tipo === 'Duplicado').length;

  return (
    <div>
      <style>{`@media(max-width:700px){.reg-kpi{grid-template-columns:1fr 1fr!important}}`}</style>
      <div className="reg-kpi" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
        {[
          { label: 'Total registros', val: ROWS.length, color: C.b, icon: '📝' },
          { label: 'Detectados', val: detectados, color: C.g, icon: '✅' },
          { label: 'Duplicados', val: duplicados, color: C.y, icon: '⚠️' },
          { label: 'Canales activos', val: 2, color: C.p, icon: '📡' },
        ].map((k, i) => (
          <div key={i} style={{ background: '#fff', border: `1.5px solid ${C.bd}`, borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 3px rgba(30,77,183,.06)', marginBottom: 0, position: 'relative' }}>
            <div style={{ height: 3, background: k.color, position: 'absolute', top: 0, left: 0, right: 0 }} />
            <div style={{ padding: '14px 16px 12px' }}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>{k.icon}</div>
              <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 26, color: C.g9 }}>{k.val}</div>
              <div style={{ fontSize: 11, color: C.g5 }}>{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', border: `1.5px solid ${C.bd}`, borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 3px rgba(30,77,183,.06)' }}>
        <div style={cardHead}>📝 SOP16 · Registro automatizado de leads</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: C.g0 }}>
                {['ID', 'Acción', 'Tipo', 'Canal', 'Fecha'].map(h => (
                  <th key={h} style={{ padding: '9px 14px', textAlign: 'left', color: C.g5, fontWeight: 600, borderBottom: `1px solid ${C.bd}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${C.g1}` }}>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: 11, background: C.g1, color: C.g5, padding: '2px 7px', borderRadius: 5, fontWeight: 700 }}>{row.id}</span>
                  </td>
                  <td style={{ padding: '10px 14px', color: C.g9 }}>{row.accion}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ background: row.tipo === 'Detectado' ? C.gl : C.yl, color: row.tipo === 'Detectado' ? C.g : C.y, fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 7 }}>{row.tipo}</span>
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: 16 }}>{row.canal === 'email' ? '📧' : '💬'}</td>
                  <td style={{ padding: '10px 14px', color: C.g5, fontSize: 12 }}>{row.fecha}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
