'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { C, card, pill } from './tokens';

interface IncidenciaRow {
  id: string;
  tipo: string;
  descripcion: string | null;
  prioridad: string;
  estado: string;
  fecha_reporte: string;
  sla_horas: number | null;
  unidad_nombre: string | null;
  propiedad_nombre: string | null;
}

function priorityColor(p: string): string {
  if (p === 'alta') return C.r;
  if (p === 'media') return C.y;
  return C.g;
}

function priorityPill(p: string): { bg: string; color: string } {
  if (p === 'alta') return pill('r');
  if (p === 'media') return pill('y');
  return pill('g');
}

function isSlaVencido(fechaReporte: string, slaHoras: number | null): boolean {
  const limite = slaHoras ?? 48;
  const diffHours = (Date.now() - new Date(fechaReporte).getTime()) / 3_600_000;
  return diffHours > limite;
}

export default function SectionIncidencias() {
  const [data, setData] = useState<IncidenciaRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const sb = createClient();
      const { data: rows, error } = await sb
        .from('incidencias')
        .select('id, tipo, descripcion, prioridad, estado, fecha_reporte, sla_horas, unidades(nombre), propiedades(nombre)')
        .order('fecha_reporte', { ascending: false });

      if (!error && rows) {
        setData(
          (rows as unknown as Array<{
            id: string;
            tipo: string;
            descripcion: string | null;
            prioridad: string;
            estado: string;
            fecha_reporte: string;
            sla_horas: number | null;
            unidades: { nombre: string } | null;
            propiedades: { nombre: string } | null;
          }>).map(r => ({
            id: r.id,
            tipo: r.tipo,
            descripcion: r.descripcion,
            prioridad: r.prioridad,
            estado: r.estado,
            fecha_reporte: r.fecha_reporte,
            sla_horas: r.sla_horas,
            unidad_nombre: r.unidades?.nombre ?? null,
            propiedad_nombre: r.propiedades?.nombre ?? null,
          }))
        );
      }
      setLoading(false);
    }
    load();
  }, []);

  const altas = data.filter((i: IncidenciaRow) => i.prioridad === 'alta').length;
  const medias = data.filter((i: IncidenciaRow) => i.prioridad === 'media').length;
  const resueltas = data.filter((i: IncidenciaRow) => i.estado === 'resuelta').length;
  const slaVencidas = data.filter((i: IncidenciaRow) => i.estado !== 'resuelta' && isSlaVencido(i.fecha_reporte, i.sla_horas)).length;

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
          { label: 'SLA Vencido', val: slaVencidas, color: C.r, icon: '⏰' },
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
        {data.map((inc: IncidenciaRow) => {
          const pStyle = priorityPill(inc.prioridad);
          const borderColor = priorityColor(inc.prioridad);
          const isResuelta = inc.estado === 'resuelta';
          const vencido = !isResuelta && isSlaVencido(inc.fecha_reporte, inc.sla_horas);
          const fecha = new Date(inc.fecha_reporte).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });

          return (
            <div key={inc.id} style={{ ...card, borderLeft: `4px solid ${borderColor}` }}>
              <div style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 6 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ ...pStyle, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 8 }}>
                      {inc.prioridad.toUpperCase()}
                    </span>
                    {isResuelta && (
                      <span style={{ background: C.gl, color: C.g, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 8 }}>RESUELTA</span>
                    )}
                    {!isResuelta && inc.estado === 'en_proceso' && (
                      <span style={{ background: C.bl, color: C.b, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 8 }}>EN PROCESO</span>
                    )}
                    {vencido && (
                      <span style={{ background: C.rl, color: C.r, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 8 }}>⏰ SLA VENCIDO</span>
                    )}
                  </div>
                </div>
                <div style={{ fontWeight: 700, fontSize: 14, color: C.g9, marginBottom: 4 }}>{inc.tipo}</div>
                {inc.descripcion && (
                  <div style={{ fontSize: 12.5, color: C.g5, marginBottom: 8 }}>{inc.descripcion}</div>
                )}
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 11, color: C.g5 }}>
                  {inc.propiedad_nombre && <span>🏠 {inc.propiedad_nombre}</span>}
                  {inc.unidad_nombre && <span>🚪 {inc.unidad_nombre}</span>}
                  <span>📅 {fecha}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
