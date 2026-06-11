'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { C, card, cardHead, cardBody } from './tokens';

interface UnidadRaw {
  id: string;
  estado: string;
  precio_actual: number | null;
  nombre?: string;
}

interface PropiedadRaw {
  id: string;
  nombre: string;
  barrio: string | null;
  unidades: UnidadRaw[];
}

interface PagoRaw {
  importe: number | null;
  mes_facturado: string | null;
  estado: string | null;
}

interface EstanciaRaw {
  id: string;
  fecha_entrada: string | null;
  fecha_salida_real: string | null;
  renta_mensual: number | null;
  unidad_id: string | null;
}

interface OcupData {
  propiedades: PropiedadRaw[];
  pagos: PagoRaw[];
  estancias: EstanciaRaw[];
}

function KpiCard({ label, value, color, icon, sub }: { label: string; value: string; color: string; icon: string; sub?: string }) {
  return (
    <div style={{ ...card, marginBottom: 0, position: 'relative', overflow: 'hidden' }}>
      <div style={{ height: 3, background: color, position: 'absolute', top: 0, left: 0, right: 0 }} />
      <div style={{ padding: '16px 16px 14px' }}>
        <div style={{ fontSize: 22, marginBottom: 6 }}>{icon}</div>
        <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 26, color: C.g9, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 11, color: C.g5, marginTop: 4 }}>{label}</div>
        {sub && <div style={{ fontSize: 10, color: C.g5, marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

export default function SectionOcupacion() {
  const [data, setData] = useState<OcupData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mesActual = new Date().toISOString().slice(0, 7);

  useEffect(() => {
    async function load() {
      try {
        const sb = createClient();
        const [r1, r2, r3] = await Promise.all([
          sb.from('propiedades').select('id, nombre, barrio, unidades(id, estado, precio_actual, nombre)'),
          sb.from('pagos').select('importe, mes_facturado, estado').eq('estado', 'PAGADO'),
          sb.from('estancias').select('id, fecha_entrada, fecha_salida_real, renta_mensual, unidad_id').eq('estado', 'ACTIVA'),
        ]);
        setData({
          propiedades: (r1.data ?? []) as unknown as PropiedadRaw[],
          pagos: (r2.data ?? []) as PagoRaw[],
          estancias: (r3.data ?? []) as EstanciaRaw[],
        });
      } catch (e) {
        setError(String(e));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return (
    <div style={{ padding: 32, color: C.g5, textAlign: 'center' }}>Cargando datos de ocupación…</div>
  );
  if (error) return (
    <div style={{ background: '#FEF2F2', border: '1.5px solid #EF4444', borderRadius: 10, padding: 16, color: '#EF4444' }}>
      ⚠️ Error: {error}
    </div>
  );

  const propiedades = data?.propiedades ?? [];
  const pagos = data?.pagos ?? [];
  const estancias = data?.estancias ?? [];

  // KPIs globales
  const totalUnidades = propiedades.reduce((s, p) => s + p.unidades.length, 0);
  const unidadesOcupadas = propiedades.reduce((s, p) => s + p.unidades.filter(u => u.estado === 'OCUPADA').length, 0);
  const ocupacionGlobal = totalUnidades > 0 ? ((unidadesOcupadas / totalUnidades) * 100).toFixed(1) : '0.0';
  const rentasActivas = estancias.map(e => e.renta_mensual ?? 0).filter(r => r > 0);
  const ticketMedio = rentasActivas.length > 0 ? Math.round(rentasActivas.reduce((s, r) => s + r, 0) / rentasActivas.length) : 0;
  const ingresosMes = pagos.filter(p => p.mes_facturado === mesActual).reduce((s, p) => s + (p.importe ?? 0), 0);

  // Por propiedad
  const pisoRows = propiedades.map(p => {
    const total = p.unidades.length;
    const ocupadas = p.unidades.filter(u => u.estado === 'OCUPADA').length;
    const libres = total - ocupadas;
    const pct = total > 0 ? Math.round((ocupadas / total) * 100) : 0;
    const ingresoEst = p.unidades.filter(u => u.estado === 'OCUPADA').reduce((s, u) => s + (u.precio_actual ?? 0), 0);
    return { id: p.id, nombre: p.nombre, barrio: p.barrio ?? '—', total, ocupadas, libres, pct, ingresoEst };
  });

  // Unidades libres
  interface UnidadLibre { nombre: string; piso: string; precio: number | null; }
  const unidadesLibres: UnidadLibre[] = propiedades.flatMap(p =>
    p.unidades
      .filter(u => u.estado === 'LIBRE')
      .map(u => ({ nombre: u.nombre ?? u.id, piso: p.nombre, precio: u.precio_actual }))
  );

  const barColor = (pct: number) => pct >= 80 ? C.g : pct >= 50 ? C.y : C.r;

  return (
    <div>
      <style>{`@media(max-width:700px){.ocp-kpi{grid-template-columns:1fr 1fr!important}.ocp-grid{grid-template-columns:1fr!important}}`}</style>

      {/* KPI Cards */}
      <div className="ocp-kpi" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
        <KpiCard label="Ocupación global" value={`${ocupacionGlobal}%`} color={C.g} icon="📊" sub={`${unidadesOcupadas}/${totalUnidades} unidades`} />
        <KpiCard label="Ticket medio" value={`${ticketMedio}€`} color={C.b} icon="💰" sub="renta media activa" />
        <KpiCard label="Ingresos mes" value={ingresosMes >= 1000 ? `${(ingresosMes / 1000).toFixed(1)}k€` : `${ingresosMes}€`} color={C.p} icon="📈" sub={`${mesActual}`} />
      </div>

      {/* Tabla por piso */}
      <div style={{ ...card, marginBottom: 14 }}>
        <div style={cardHead}>🏘️ Ocupación por piso</div>
        <div style={{ overflowX: 'auto' }}>
          {pisoRows.length === 0 ? (
            <div style={{ ...cardBody, color: C.g5, fontSize: 13 }}>Sin propiedades registradas.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#F0F4FF' }}>
                  {['Piso', 'Barrio', 'Total', 'Ocup.', 'Libres', 'Ocupación', 'Ingreso est.'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: '#1E4DB7', fontWeight: 700, fontSize: 11, borderBottom: '2px solid #E2E6EF', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pisoRows.map((row, i) => (
                  <tr key={row.id} style={{ background: i % 2 === 0 ? 'white' : '#F8FAFF', borderBottom: '1px solid #F0F0F0' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: '#111827' }}>{row.nombre}</td>
                    <td style={{ padding: '10px 14px', color: C.g5 }}>{row.barrio}</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', color: '#111827' }}>{row.total}</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 700, color: C.g }}>{row.ocupadas}</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', color: row.libres > 0 ? C.r : C.g5 }}>{row.libres}</td>
                    <td style={{ padding: '10px 14px', minWidth: 120 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 7, background: C.g1, borderRadius: 4 }}>
                          <div style={{ height: '100%', width: `${row.pct}%`, background: barColor(row.pct), borderRadius: 4, transition: 'width .4s' }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: barColor(row.pct), minWidth: 36 }}>{row.pct}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: '#111827', whiteSpace: 'nowrap' }}>
                      {row.ingresoEst > 0 ? `${row.ingresoEst.toLocaleString()}€` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Unidades libres */}
      <div style={card}>
        <div style={cardHead}>🔴 Unidades sin ocupar ({unidadesLibres.length})</div>
        <div style={cardBody}>
          {unidadesLibres.length === 0 ? (
            <div style={{ fontSize: 13, color: C.g5, textAlign: 'center', padding: '8px 0' }}>✅ Todas las unidades están ocupadas</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
              {unidadesLibres.map((u, i) => (
                <div key={i} style={{ border: '1.5px solid #FEE2E2', borderRadius: 10, padding: '12px 14px', background: '#FFF5F5' }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#111827', marginBottom: 3 }}>{u.nombre}</div>
                  <div style={{ fontSize: 12, color: C.g5, marginBottom: 6 }}>{u.piso}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: u.precio ? C.b : C.g5 }}>
                    {u.precio ? `${u.precio.toLocaleString()}€/mes` : 'Sin precio'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
