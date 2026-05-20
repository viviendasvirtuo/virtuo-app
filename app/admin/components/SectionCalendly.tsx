import { C, card, cardHead } from './tokens';

interface CalendlyRow {
  id: string;
  nombre: string;
  recordatorios: number;
  maxRecordatorios: number;
  estado: string;
  evento?: string;
}

const ROWS: CalendlyRow[] = [
  { id: 'TEST_01', nombre: 'Test candidato 01', recordatorios: 1, maxRecordatorios: 3, estado: 'activo' },
  { id: 'TEST_02', nombre: 'Test candidato 02', recordatorios: 2, maxRecordatorios: 3, estado: 'activo' },
  { id: 'TEST_03', nombre: 'Test candidato 03', recordatorios: 3, maxRecordatorios: 3, estado: 'max' },
  { id: 'TEST_04', nombre: 'Test candidato 04', recordatorios: 0, maxRecordatorios: 3, estado: 'bloqueado' },
  { id: 'TEST_05', nombre: 'Test candidato 05', recordatorios: 1, maxRecordatorios: 3, estado: 'evento', evento: 'Visita 23 May 11:00' },
  { id: 'PROP_CORTS_BARC', nombre: 'Propietario Les Corts', recordatorios: 0, maxRecordatorios: 3, estado: 'nuevo' },
  { id: 'PROP_SANTS_BARC', nombre: 'Propietario Sants', recordatorios: 0, maxRecordatorios: 3, estado: 'nuevo' },
];

function StatusBadge({ estado }: { estado: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    activo: { bg: C.bl, color: C.b, label: 'Activo' },
    max: { bg: C.rl, color: C.r, label: '⛔ Max recordatorios' },
    bloqueado: { bg: C.g1, color: C.g5, label: '🔒 Bloqueado' },
    evento: { bg: C.gl, color: C.g, label: '✅ Evento agendado' },
    nuevo: { bg: C.yl, color: C.y, label: '🆕 Nuevo' },
  };
  const s = map[estado] ?? { bg: C.g1, color: C.g5, label: estado };
  return <span style={{ background: s.bg, color: s.color, fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 7 }}>{s.label}</span>;
}

function RecordatorioCircles({ count, max }: { count: number; max: number }) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {Array.from({ length: max }).map((_, i) => (
        <div key={i} style={{
          width: 14, height: 14, borderRadius: '50%',
          background: i < count ? C.b : C.g1,
          border: `1.5px solid ${i < count ? C.b : C.bd}`,
        }} />
      ))}
    </div>
  );
}

export default function SectionCalendly() {
  const total = ROWS.length;
  const conEvento = ROWS.filter(r => r.estado === 'evento').length;
  const bloqueados = ROWS.filter(r => r.estado === 'bloqueado' || r.estado === 'max').length;
  const nuevos = ROWS.filter(r => r.estado === 'nuevo').length;

  return (
    <div>
      <style>{`@media(max-width:700px){.cal-kpi{grid-template-columns:1fr 1fr!important}}`}</style>
      <div className="cal-kpi" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
        {[
          { label: 'Total seguimientos', val: total, color: C.b, icon: '📅' },
          { label: 'Con evento', val: conEvento, color: C.g, icon: '✅' },
          { label: 'Bloqueados', val: bloqueados, color: C.r, icon: '⛔' },
          { label: 'Nuevos', val: nuevos, color: C.y, icon: '🆕' },
        ].map((k, i) => (
          <div key={i} style={{ ...card, marginBottom: 0, position: 'relative', overflow: 'hidden' }}>
            <div style={{ height: 3, background: k.color, position: 'absolute', top: 0, left: 0, right: 0 }} />
            <div style={{ padding: '14px 16px 12px' }}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>{k.icon}</div>
              <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 26, color: C.g9 }}>{k.val}</div>
              <div style={{ fontSize: 11, color: C.g5 }}>{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={card}>
        <div style={cardHead}>📅 Tracker de seguimientos Calendly</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: C.g0 }}>
                {['ID', 'Candidato', 'Recordatorios', 'Evento', 'Estado'].map(h => (
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
                  <td style={{ padding: '10px 14px', fontWeight: 600, color: C.g9 }}>{row.nombre}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <RecordatorioCircles count={row.recordatorios} max={row.maxRecordatorios} />
                  </td>
                  <td style={{ padding: '10px 14px', color: C.g5, fontSize: 12 }}>{row.evento ?? '—'}</td>
                  <td style={{ padding: '10px 14px' }}><StatusBadge estado={row.estado} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
