'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { C, card, cardHead, cardBody, pill } from './tokens';

interface Incidencia {
  id: string;
  codigo?: string;
  titulo?: string;
  descripcion?: string;
  prioridad?: string;
  estado?: string;
  piso?: string;
  proveedor?: string;
  created_at?: string;
  sla?: string;
}

const STATIC: Incidencia[] = [
  { id: '1', codigo: 'INC_20260415_001', titulo: 'Avería caldera agua caliente', descripcion: 'Sin agua caliente en habitaciones 3 y 4. Requiere fontanero urgente.', prioridad: 'alta', estado: 'ABIERTA', piso: 'Bulevar Pirineus', proveedor: 'Fontanería Roca SL', created_at: '2026-04-15', sla: '24h' },
  { id: '2', codigo: 'INC_20260412_002', titulo: 'Cerradura puerta principal', descripcion: 'Dificultad para abrir con llave. Necesita revisión de cerrajero.', prioridad: 'media', estado: 'ABIERTA', piso: 'Sants 10', proveedor: 'Cerrajería Central', created_at: '2026-04-12', sla: '72h' },
  { id: '3', codigo: 'INC_20260401_003', titulo: 'Reparación grifo cocina', descripcion: 'Grifo con fuga leve. Reparado satisfactoriamente.', prioridad: 'baja', estado: 'RESUELTA', piso: 'Sants 10', proveedor: 'Limpiezas Maresme SL', created_at: '2026-04-01', sla: '—' },
];

function priorityColor(p?: string): string {
  if (p === 'alta') return C.r;
  if (p === 'media') return C.y;
  return C.g;
}

function priorityPill(p?: string): { bg: string; color: string } {
  if (p === 'alta') return pill('r');
  if (p === 'media') return pill('y');
  return pill('g');
}

export default function SectionIncidencias() {
  const [data, setData] = useState<Incidencia[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const sb = createClient();
        const { data: rows, error } = await sb.from('incidencias').select('*').order('created_at', { ascending: false });
        if (error || !rows || rows.length === 0) throw new Error('no data');
        setData(rows as Incidencia[]);
      } catch {
        setData(STATIC);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const altas = data.filter((i: Incidencia) => i.prioridad === 'alta').length;
  const medias = data.filter((i: Incidencia) => i.prioridad === 'media').length;
  const resueltas = data.filter((i: Incidencia) => i.estado === 'RESUELTA').length;

  if (loading) return (
    <div>
      {[1, 2, 3, 4].map(i => <div key={i} style={{ background: C.g1, borderRadius: 10, height: 60, marginBottom: 12 }} />)}
    </div>
  );

  return (
    <div>
      <style>{`@media(max-width:700px){.inc-kpi{grid-template-columns:1fr 1fr!important}}`}</style>
      <div className="inc-kpi" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
        {[
          { label: 'Prioridad Alta', val: altas, color: C.r, icon: '🔴' },
          { label: 'Prioridad Media', val: medias, color: C.y, icon: '🟡' },
          { label: 'Resueltas', val: resueltas, color: C.g, icon: '✅' },
          { label: 'T. Resolución', val: '18h', color: C.b, icon: '⏱️' },
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

      <div>
        {data.map((inc: Incidencia) => {
          const pStyle = priorityPill(inc.prioridad);
          const borderColor = priorityColor(inc.prioridad);
          const isResuelta = inc.estado === 'RESUELTA';
          return (
            <div key={inc.id} style={{ ...card, borderLeft: `4px solid ${borderColor}` }}>
              <div style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 6 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: 11, background: C.g1, color: C.g5, padding: '2px 7px', borderRadius: 5, fontWeight: 700 }}>{inc.codigo ?? inc.id}</span>
                    <span style={{ ...pStyle, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 8 }}>{inc.prioridad?.toUpperCase() ?? '—'}</span>
                    {isResuelta && (
                      <span style={{ background: C.gl, color: C.g, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 8 }}>RESUELTA</span>
                    )}
                  </div>
                </div>
                <div style={{ fontWeight: 700, fontSize: 14, color: C.g9, marginBottom: 4 }}>{inc.titulo ?? 'Sin título'}</div>
                {inc.descripcion && <div style={{ fontSize: 12.5, color: C.g5, marginBottom: 8 }}>{inc.descripcion}</div>}
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 11, color: C.g5 }}>
                  {inc.piso && <span>🏠 {inc.piso}</span>}
                  {inc.proveedor && <span>🔧 {inc.proveedor}</span>}
                  {inc.created_at && <span>📅 {inc.created_at}</span>}
                  {inc.sla && <span>⏱️ SLA: {inc.sla}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
