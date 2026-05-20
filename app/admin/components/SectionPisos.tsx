'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { C, card, cardHead, cardBody } from './tokens';

interface Propiedad {
  id: string;
  nombre: string;
  codigo?: string;
  direccion?: string;
  color?: string;
  habitaciones?: number;
  banos?: number;
  alquiler_propietario?: number;
  total_unidades?: number;
  ocupadas?: number;
}

interface Unidad {
  id: string;
  codigo?: string;
  estado?: string;
  propiedad_id?: string;
}

const STATIC_PISOS: Propiedad[] = [
  { id: '1', nombre: 'Sants 10', codigo: 'SANTS', color: C.b, habitaciones: 6, banos: 2, alquiler_propietario: 1600, total_unidades: 6, ocupadas: 5 },
  { id: '2', nombre: 'Plaza de Palau 10', codigo: 'PALAU', color: C.p, habitaciones: 4, banos: 1, alquiler_propietario: 1800, total_unidades: 4, ocupadas: 0 },
  { id: '3', nombre: 'Bulevar Pirineus 5', codigo: 'PIRINEUS', color: C.g, habitaciones: 5, banos: 2, alquiler_propietario: 1400, total_unidades: 5, ocupadas: 4 },
];

const STATIC_UNIDADES: Record<string, Unidad[]> = {
  '1': [
    { id: 'u1', codigo: 'HAB1', estado: 'OCUPADA' },
    { id: 'u2', codigo: 'HAB2', estado: 'OCUPADA' },
    { id: 'u3', codigo: 'HAB3', estado: 'OCUPADA' },
    { id: 'u4', codigo: 'HAB4', estado: 'OCUPADA' },
    { id: 'u5', codigo: 'HAB5', estado: 'OCUPADA' },
    { id: 'u6', codigo: 'HAB6', estado: 'LIBRE' },
  ],
  '2': [
    { id: 'u7', codigo: 'HAB1', estado: 'LIBRE' },
    { id: 'u8', codigo: 'HAB2', estado: 'LIBRE' },
    { id: 'u9', codigo: 'HAB3', estado: 'LIBRE' },
    { id: 'u10', codigo: 'HAB4', estado: 'LIBRE' },
  ],
  '3': [
    { id: 'u11', codigo: 'HAB1', estado: 'OCUPADA' },
    { id: 'u12', codigo: 'HAB2', estado: 'OCUPADA' },
    { id: 'u13', codigo: 'HAB3', estado: 'OCUPADA' },
    { id: 'u14', codigo: 'HAB4', estado: 'OCUPADA' },
    { id: 'u15', codigo: 'HAB5', estado: 'LIBRE' },
  ],
};

const COLORS = [C.b, C.p, C.g, C.y, C.r];

export default function SectionPisos() {
  const [pisos, setPisos] = useState<Propiedad[]>([]);
  const [unidades, setUnidades] = useState<Record<string, Unidad[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const sb = createClient();
        const { data: props, error: propErr } = await sb
          .from('propiedades')
          .select('*, unidades(id, codigo, estado)');

        if (propErr || !props || props.length === 0) throw new Error(propErr?.message ?? 'no data');

        const pList: Propiedad[] = [];
        const uMap: Record<string, Unidad[]> = {};
        (props as Array<Record<string, unknown>>).forEach((p: Record<string, unknown>, idx: number) => {
          const unis: Unidad[] = (p.unidades as Unidad[] | null) ?? [];
          const ocupadas = unis.filter((u: Unidad) => u.estado === 'OCUPADA').length;
          pList.push({
            id: String(p.id),
            nombre: String(p.nombre ?? ''),
            codigo: p.codigo ? String(p.codigo) : undefined,
            direccion: p.direccion ? String(p.direccion) : undefined,
            color: COLORS[idx % COLORS.length],
            habitaciones: typeof p.habitaciones === 'number' ? p.habitaciones : unis.length,
            banos: typeof p.banos === 'number' ? p.banos : 1,
            alquiler_propietario: typeof p.alquiler_propietario === 'number' ? p.alquiler_propietario : 0,
            total_unidades: unis.length,
            ocupadas,
          });
          uMap[String(p.id)] = unis;
        });
        setPisos(pList);
        setUnidades(uMap);
      } catch {
        setPisos(STATIC_PISOS);
        setUnidades(STATIC_UNIDADES);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (error) return (
    <div style={{ background: C.rl, border: `1.5px solid ${C.r}`, borderRadius: 10, padding: 16, color: C.r }}>⚠️ {error}</div>
  );

  if (loading) return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
      {[1,2,3].map(i => <div key={i} style={{ background: C.g1, borderRadius: 14, height: 280 }} />)}
    </div>
  );

  return (
    <div>
      <style>{`@media(max-width:700px){.pisos-grid{grid-template-columns:1fr!important}}`}</style>
      <div className="pisos-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {pisos.map((p: Propiedad) => {
          const unis = unidades[p.id] ?? [];
          const total = p.total_unidades ?? unis.length;
          const ocp = p.ocupadas ?? unis.filter((u: Unidad) => u.estado === 'OCUPADA').length;
          const pct = total > 0 ? Math.round((ocp / total) * 100) : 0;
          const color = p.color ?? C.b;
          const rent = p.alquiler_propietario ?? 0;
          const rentPerHab = total > 0 ? Math.round(rent / total) : 0;

          return (
            <div key={p.id} style={{ ...card, marginBottom: 0 }}>
              <div style={{ height: 4, background: color }} />
              <div style={{ padding: '14px 16px 6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 16, color: C.g9 }}>{p.nombre}</div>
                  {p.codigo && <div style={{ fontSize: 11, color: C.g5, marginTop: 2 }}>{p.codigo} {p.direccion ? '· ' + p.direccion : ''}</div>}
                </div>
                <span style={{ background: pct >= 75 ? C.gl : pct > 0 ? C.yl : C.rl, color: pct >= 75 ? C.g : pct > 0 ? C.y : C.r, fontWeight: 700, fontSize: 11, padding: '3px 9px', borderRadius: 8 }}>{pct}%</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 0, margin: '8px 0', borderTop: `1px solid ${C.g1}`, borderBottom: `1px solid ${C.g1}` }}>
                {[
                  { label: 'Habitaciones', val: p.habitaciones ?? total },
                  { label: 'Baños', val: p.banos ?? 1 },
                  { label: 'Alquiler prop.', val: `${rent}€` },
                  { label: 'Ocupación', val: `${ocp}/${total}` },
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
                  {(unis.length > 0 ? unis : Array.from({ length: total }, (_, k) => ({ id: `s${k}`, codigo: `HAB${k + 1}`, estado: k < ocp ? 'OCUPADA' : 'LIBRE' }))).map((u: { id: string; codigo: string; estado: string }) => (
                    <span key={u.id} style={{
                      background: u.estado === 'OCUPADA' ? C.bl : C.g1,
                      color: u.estado === 'OCUPADA' ? C.b : C.g5,
                      border: `1px solid ${u.estado === 'OCUPADA' ? C.b : C.bd}`,
                      borderRadius: 6, padding: '3px 8px', fontSize: 11, fontWeight: 600,
                    }}>{u.codigo ?? 'HAB'}</span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                  <span style={{ background: C.g1, color: C.g5, borderRadius: 6, padding: '2px 8px', fontSize: 10, fontWeight: 600 }}>🏠 Cohousing</span>
                  <span style={{ background: C.bl, color: C.b, borderRadius: 6, padding: '2px 8px', fontSize: 10, fontWeight: 600 }}>💰 {rentPerHab}€/hab</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

