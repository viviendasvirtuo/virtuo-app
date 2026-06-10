// SectionPisos
'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { C, card } from './tokens';

interface Habitacion {
  id: string;
  numero: string;
  estado: string;
  precio_mensual: number;
}

interface Propiedad {
  id: string;
  nombre: string;
  direccion: string | null;
  ciudad: string | null;
  total_habitaciones: number;
  color: string;
  habitaciones: Habitacion[];
}

interface PropiedadRaw {
  id: string;
  nombre: string;
  direccion: string | null;
  ciudad: string | null;
  total_habitaciones: number;
}

const COLORS = [C.b, C.p, C.g, C.y, C.r];

export default function SectionPisos() {
  const [pisos, setPisos] = useState<Propiedad[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const sb = createClient();

      // Paso 1: cargar propiedades
      const { data: props, error: propsError } = await sb
        .from('propiedades')
        .select('*')
        .order('nombre');

      if (propsError) {
        console.error('[SectionPisos] Error cargando propiedades:', propsError);
        setDbError(`code: ${propsError.code} | message: ${propsError.message} | details: ${propsError.details} | hint: ${propsError.hint}`);
        setLoading(false);
        return;
      }

      if (!props || props.length === 0) {
        console.error('[SectionPisos] La tabla propiedades devolvió 0 filas');
        setDbError('Sin datos — code: (none) | La query no devolvió filas. RLS puede estar bloqueando o la tabla está vacía.');
        setLoading(false);
        return;
      }

      // Paso 2: cargar habitaciones de cada propiedad
      const result: Propiedad[] = [];
      for (const [idx, p] of (props as PropiedadRaw[]).entries()) {
        const { data: habs, error: habsError } = await sb
          .from('habitaciones')
          .select('*')
          .eq('propiedad_id', p.id)
          .order('numero');

        if (habsError) {
          console.error(`[SectionPisos] Error cargando habitaciones de ${p.nombre}:`, habsError);
        }

        result.push({
          id: p.id,
          nombre: p.nombre,
          direccion: p.direccion,
          ciudad: p.ciudad,
          total_habitaciones: p.total_habitaciones ?? 0,
          color: COLORS[idx % COLORS.length],
          habitaciones: (habs ?? []) as Habitacion[],
        });
      }

      setPisos(result);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
      {[1, 2, 3].map(i => <div key={i} style={{ background: C.g1, borderRadius: 14, height: 280 }} />)}
    </div>
  );

  if (dbError) return (
    <div style={{ ...card, padding: '20px 24px', borderLeft: `4px solid ${C.r}` }}>
      <div style={{ fontWeight: 700, color: C.r, marginBottom: 6 }}>Error al cargar propiedades</div>
      <div style={{ fontSize: 12, color: C.g5, fontFamily: 'monospace' }}>{dbError}</div>
    </div>
  );

  if (pisos.length === 0) return (
    <div style={{ ...card, padding: '20px 24px', borderLeft: `4px solid ${C.y}` }}>
      <div style={{ fontWeight: 700, color: C.y, marginBottom: 6 }}>Sin datos</div>
      <div style={{ fontSize: 12, color: C.g5 }}>No se encontraron propiedades en la base de datos.</div>
    </div>
  );

  return (
    <div>
      <style>{`@media(max-width:700px){.pisos-grid{grid-template-columns:1fr!important}}`}</style>
      <div className="pisos-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {pisos.map((p: Propiedad) => {
          const habs = p.habitaciones;
          const total = habs.length > 0 ? habs.length : p.total_habitaciones;
          const ocp = habs.filter((h: Habitacion) => h.estado === 'ocupada').length;
          const libres = habs.filter((h: Habitacion) => h.estado === 'libre').length;
          const pct = total > 0 ? Math.round((ocp / total) * 100) : 0;
          const ingresos = habs
            .filter((h: Habitacion) => h.estado === 'ocupada')
            .reduce((s: number, h: Habitacion) => s + Number(h.precio_mensual), 0);
          const color = p.color;

          return (
            <div key={p.id} style={{ ...card, marginBottom: 0 }}>
              <div style={{ height: 4, background: color }} />
              <div style={{ padding: '14px 16px 6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 16, color: C.g9 }}>{p.nombre}</div>
                  {(p.ciudad || p.direccion) && (
                    <div style={{ fontSize: 11, color: C.g5, marginTop: 2 }}>
                      {[p.ciudad, p.direccion].filter(Boolean).join(' · ')}
                    </div>
                  )}
                </div>
                <span style={{
                  background: pct >= 75 ? C.gl : pct > 0 ? C.yl : C.rl,
                  color: pct >= 75 ? C.g : pct > 0 ? C.y : C.r,
                  fontWeight: 700, fontSize: 11, padding: '3px 9px', borderRadius: 8,
                }}>{pct}%</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 0, margin: '8px 0', borderTop: `1px solid ${C.g1}`, borderBottom: `1px solid ${C.g1}` }}>
                {[
                  { label: 'Habitaciones', val: total },
                  { label: 'Ocupadas', val: ocp },
                  { label: 'Libres', val: libres },
                  { label: 'Ingresos/mes', val: `${ingresos.toLocaleString()}€` },
                ].map((s, i) => (
                  <div key={i} style={{ padding: '10px 12px', borderRight: i < 3 ? `1px solid ${C.g1}` : 'none', textAlign: 'center' }}>
                    <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 16, color: C.g9 }}>{s.val}</div>
                    <div style={{ fontSize: 10, color: C.g5, marginTop: 2 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              <div style={{ padding: '0 16px 10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: C.g5, marginBottom: 5 }}>
                  <span>Ocupación</span><span>{pct}%</span>
                </div>
                <div style={{ height: 6, background: C.g1, borderRadius: 4, marginBottom: 12 }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 4 }} />
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {habs.map((h: Habitacion) => (
                    <span key={h.id} style={{
                      background: h.estado === 'ocupada' ? C.bl : C.g1,
                      color: h.estado === 'ocupada' ? C.b : C.g5,
                      border: `1px solid ${h.estado === 'ocupada' ? C.b : C.bd}`,
                      borderRadius: 6, padding: '3px 8px', fontSize: 11, fontWeight: 600,
                    }}>{h.numero}</span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                  <span style={{ background: C.g1, color: C.g5, borderRadius: 6, padding: '2px 8px', fontSize: 10, fontWeight: 600 }}>🏠 Cohousing</span>
                  <span style={{ background: C.bl, color: C.b, borderRadius: 6, padding: '2px 8px', fontSize: 10, fontWeight: 600 }}>💰 {total > 0 ? Math.round(ingresos / total) : 0}€/hab</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
