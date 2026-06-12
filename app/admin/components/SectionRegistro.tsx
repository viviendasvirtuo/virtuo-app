'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { C, cardHead } from './tokens';

interface RegistroRow {
  id: string;
  tipo: string | null;
  nombre: string | null;
  email: string | null;
  telefono: string | null;
  accion: string | null;
  canal: string | null;
  make_escenario: string | null;
  es_duplicado: boolean | null;
  referencia_existente: string | null;
  fecha: string | null;
}

function canalIcon(canal: string | null): string {
  if (canal === 'email') return '📧';
  if (canal === 'whatsapp') return '💬';
  if (canal === 'make') return '⚡';
  if (canal === 'tally') return '📋';
  return '📡';
}

function fmtFecha(f: string | null): string {
  if (!f) return '—';
  const d = new Date(f);
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: '2-digit' }) +
    ' ' + d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

export default function SectionRegistro() {
  const [rows, setRows] = useState<RegistroRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const sb = createClient();
        const { data, error: err } = await sb
          .from('registro_contactos')
          .select('id, tipo, nombre, email, telefono, accion, canal, make_escenario, es_duplicado, referencia_existente, fecha')
          .order('fecha', { ascending: false })
          .limit(50);
        if (err) { setError(err.message); return; }
        setRows((data ?? []) as RegistroRow[]);
      } catch (e) {
        setError(String(e));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const total = rows.length;
  const detectados = rows.filter(r => !r.es_duplicado).length;
  const duplicados = rows.filter(r => r.es_duplicado).length;
  const canalesActivos = new Set(rows.map(r => r.canal).filter(Boolean)).size;

  if (loading) return (
    <div style={{ padding: 32, color: C.g5, textAlign: 'center' }}>Cargando registros…</div>
  );
  if (error) return (
    <div style={{ background: '#FEF2F2', border: '1.5px solid #EF4444', borderRadius: 10, padding: 16, color: '#EF4444' }}>
      ⚠️ Error: {error}
    </div>
  );

  return (
    <div>
      <style>{`@media(max-width:700px){.reg-kpi{grid-template-columns:1fr 1fr!important}}`}</style>
      <div className="reg-kpi" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
        {[
          { label: 'Total registros', val: total, color: C.b, icon: '📝' },
          { label: 'Detectados', val: detectados, color: C.g, icon: '✅' },
          { label: 'Duplicados', val: duplicados, color: C.y, icon: '⚠️' },
          { label: 'Canales activos', val: canalesActivos, color: C.p, icon: '📡' },
        ].map((k, i) => (
          <div key={i} style={{ background: '#fff', border: `1.5px solid ${C.bd}`, borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 3px rgba(30,77,183,.06)', position: 'relative' }}>
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
        {rows.length === 0 ? (
          <div style={{ padding: '40px 24px', textAlign: 'center', color: C.g5 }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>📭</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.g9, marginBottom: 6 }}>No hay registros todavía</div>
            <div style={{ fontSize: 12.5 }}>Los registros se crean automáticamente desde Make (escenario SOP16).</div>
          </div>
        ) : (
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
                {rows.map((row, i) => (
                  <tr key={row.id} style={{ borderBottom: `1px solid ${C.g1}`, background: i % 2 === 0 ? '#fff' : '#F8FAFF' }}>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ fontFamily: 'monospace', fontSize: 11, background: C.g1, color: C.g5, padding: '2px 7px', borderRadius: 5, fontWeight: 700 }}>{row.id.slice(-8)}</span>
                    </td>
                    <td style={{ padding: '10px 14px', color: C.g9 }}>
                      {row.accion ?? (row.nombre ? `Contacto — ${row.nombre}` : '—')}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{
                        background: row.es_duplicado ? C.yl : C.gl,
                        color: row.es_duplicado ? C.y : C.g,
                        fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 7,
                      }}>
                        {row.es_duplicado ? 'Duplicado' : 'Detectado'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', fontSize: 16 }}>{canalIcon(row.canal)}</td>
                    <td style={{ padding: '10px 14px', color: C.g5, fontSize: 12 }}>{fmtFecha(row.fecha)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
