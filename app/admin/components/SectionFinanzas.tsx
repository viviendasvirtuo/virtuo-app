'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { C, card, cardHead, cardBody } from './tokens';

interface MesData {
  mes: string;
  mes_key: string;
  ingresos: number;
  gastos: number;
  beneficio: number;
}

interface GastoCategoria {
  cat: string;
  val: number;
  color: string;
}

interface PagoDetalle {
  id: string;
  propiedad: string;
  habitacion: string;
  inquilino: string;
  importe: number;
  estado: string;
}

const CAT_COLORS: Record<string, string> = {
  Alquiler: C.b,
  Limpieza: C.p,
  Suministros: C.y,
  Mantenimiento: C.g,
  Otros: C.g5,
};

function extractCategoria(concepto: string): string {
  const c = concepto.toLowerCase();
  if (c.includes('alquiler')) return 'Alquiler';
  if (c.includes('limpieza')) return 'Limpieza';
  if (c.includes('suministro')) return 'Suministros';
  if (c.includes('mantenimiento')) return 'Mantenimiento';
  return 'Otros';
}

function mesLabel(key: string): string {
  const [yr, mo] = key.split('-');
  const label = new Date(Number(yr), Number(mo) - 1, 1)
    .toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export default function SectionFinanzas() {
  const [meses, setMeses] = useState<MesData[]>([]);
  const [breakdown, setBreakdown] = useState<GastoCategoria[]>([]);
  const [pagosDetalle, setPagosDetalle] = useState<PagoDetalle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMes, setSelectedMes] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const sb = createClient();

        const [pagosRes, gastosRes, pagosDetRes] = await Promise.all([
          sb.from('pagos').select('importe, fecha_vencimiento, estado'),
          sb.from('gastos').select('importe, fecha_pago, mes, concepto'),
          sb.from('pagos').select(
            'id, importe, fecha_vencimiento, fecha_pago, estado, mes_facturado, estancias(inquilinos(nombre, apellidos), unidades(nombre, propiedades(nombre)))'
          ).order('fecha_vencimiento', { ascending: false }).limit(15),
        ]);

        // P&L por mes
        const ingMap: Record<string, number> = {};
        for (const p of (pagosRes.data ?? [])) {
          if ((p as { estado: string }).estado === 'pagado') {
            const key = (p as { fecha_vencimiento: string }).fecha_vencimiento.substring(0, 7);
            ingMap[key] = (ingMap[key] ?? 0) + Number((p as { importe: string }).importe);
          }
        }
        const gastMap: Record<string, number> = {};
        for (const g of (gastosRes.data ?? [])) {
          const key = (g as { fecha_pago: string }).fecha_pago.substring(0, 7);
          gastMap[key] = (gastMap[key] ?? 0) + Number((g as { importe: string }).importe);
        }
        const allMonths = [...new Set([...Object.keys(ingMap), ...Object.keys(gastMap)])].sort().reverse();
        const mesesData: MesData[] = allMonths.map(k => ({
          mes: mesLabel(k),
          mes_key: k,
          ingresos: ingMap[k] ?? 0,
          gastos: gastMap[k] ?? 0,
          beneficio: (ingMap[k] ?? 0) - (gastMap[k] ?? 0),
        }));

        // Desglose gastos
        const catMap: Record<string, number> = {};
        for (const g of (gastosRes.data ?? [])) {
          const cat = extractCategoria((g as { concepto: string }).concepto);
          catMap[cat] = (catMap[cat] ?? 0) + Number((g as { importe: string }).importe);
        }
        const breakdownData: GastoCategoria[] = Object.entries(catMap)
          .sort(([, a], [, b]) => b - a)
          .map(([cat, val]) => ({ cat, val, color: CAT_COLORS[cat] ?? C.g5 }));

        // Detalle pagos recientes
        type PagoRaw = {
          id: string;
          importe: string | number;
          fecha_vencimiento: string;
          fecha_pago: string | null;
          estado: string;
          mes_facturado: string | null;
          estancias: {
            inquilinos: { nombre: string; apellidos: string | null } | null;
            unidades: {
              nombre: string;
              propiedades: { nombre: string } | null;
            } | null;
          } | null;
        };
        const detData: PagoDetalle[] = ((pagosDetRes.data ?? []) as unknown as PagoRaw[]).map(p => {
          const inq = p.estancias?.inquilinos;
          const nombreCompleto = inq ? [inq.nombre, inq.apellidos].filter(Boolean).join(' ') : '—';
          return {
            id: p.id,
            inquilino: nombreCompleto,
            habitacion: p.estancias?.unidades?.nombre ?? '—',
            propiedad: p.estancias?.unidades?.propiedades?.nombre ?? '—',
            importe: Number(p.importe),
            estado: p.estado,
          };
        });

        setMeses(mesesData);
        setBreakdown(breakdownData);
        setPagosDetalle(detData);
      } catch (e) {
        console.error('SectionFinanzas:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const totalIngresos = meses.reduce((a: number, m: MesData) => a + m.ingresos, 0);
  const totalGastos = meses.reduce((a: number, m: MesData) => a + m.gastos, 0);
  const totalBeneficio = meses.reduce((a: number, m: MesData) => a + m.beneficio, 0);
  const maxVal = meses.length > 0 ? Math.max(...meses.map((m: MesData) => Math.max(m.ingresos, m.gastos, 1))) : 1;

  if (loading) return (
    <div>
      {[1, 2, 3].map(i => <div key={i} style={{ background: C.g1, borderRadius: 10, height: 80, marginBottom: 12 }} />)}
    </div>
  );

  return (
    <div>
      <style>{`@media(max-width:700px){.fin-kpi{grid-template-columns:1fr 1fr!important}.fin-grid{grid-template-columns:1fr!important}}`}</style>
      <div className="fin-kpi" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
        {[
          { label: 'Ingresos totales', val: `${totalIngresos.toLocaleString()}€`, color: C.g, icon: '📈' },
          { label: 'Gastos totales', val: `${totalGastos.toLocaleString()}€`, color: C.r, icon: '📉' },
          { label: 'Beneficio neto', val: `${totalBeneficio.toLocaleString()}€`, color: totalBeneficio >= 0 ? C.b : C.r, icon: '💰' },
          { label: 'Meses con datos', val: meses.length, color: C.y, icon: '📅' },
        ].map((k, i) => (
          <div key={i} style={{ ...card, marginBottom: 0, position: 'relative', overflow: 'hidden' }}>
            <div style={{ height: 3, background: k.color, position: 'absolute', top: 0, left: 0, right: 0 }} />
            <div style={{ padding: '14px 16px 12px' }}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>{k.icon}</div>
              <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 22, color: C.g9 }}>{k.val}</div>
              <div style={{ fontSize: 11, color: C.g5 }}>{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="fin-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        <div style={card}>
          <div style={cardHead}>📅 P&L Mensual</div>
          <div style={cardBody}>
            {meses.map((m: MesData, i: number) => (
              <div
                key={m.mes_key}
                onClick={() => setSelectedMes(i)}
                style={{ padding: '10px 12px', borderRadius: 9, marginBottom: 6, cursor: 'pointer', background: selectedMes === i ? C.bl : C.g0, border: `1.5px solid ${selectedMes === i ? C.b : C.bd}` }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13, fontWeight: 600, color: C.g9 }}>
                  <span>{m.mes}</span>
                  <span style={{ color: m.beneficio >= 0 ? C.g : C.r }}>
                    {m.beneficio >= 0 ? '+' : ''}{m.beneficio.toLocaleString()}€
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  <div style={{ flex: m.ingresos / maxVal, height: 6, background: C.g, borderRadius: 3, minWidth: 2 }} />
                  <div style={{ flex: m.gastos / maxVal, height: 6, background: C.r, borderRadius: 3, minWidth: 2 }} />
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 4, fontSize: 11, color: C.g5 }}>
                  <span style={{ color: C.g }}>▲ {m.ingresos.toLocaleString()}€</span>
                  <span style={{ color: C.r }}>▼ {m.gastos.toLocaleString()}€</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={card}>
          <div style={cardHead}>🔍 Desglose gastos</div>
          <div style={cardBody}>
            {breakdown.map((g: GastoCategoria, i: number) => {
              const total = breakdown.reduce((a: number, x: GastoCategoria) => a + x.val, 0);
              const pct = total > 0 ? Math.round((g.val / total) * 100) : 0;
              return (
                <div key={i} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, fontWeight: 600, color: C.g9, marginBottom: 4 }}>
                    <span>{g.cat}</span>
                    <span style={{ color: C.g5 }}>{g.val.toLocaleString()}€ · {pct}%</span>
                  </div>
                  <div style={{ height: 5, background: C.g1, borderRadius: 3 }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: g.color, borderRadius: 3 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div style={card}>
        <div style={cardHead}>💳 Pagos recientes</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: C.g0 }}>
                {['Propiedad', 'Habitación', 'Inquilino', 'Importe', 'Estado'].map(h => (
                  <th key={h} style={{ padding: '9px 14px', textAlign: 'left', color: C.g5, fontWeight: 600, borderBottom: `1px solid ${C.bd}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pagosDetalle.map((row: PagoDetalle) => (
                <tr key={row.id} style={{ borderBottom: `1px solid ${C.g1}` }}>
                  <td style={{ padding: '9px 14px', color: C.g9 }}>{row.propiedad}</td>
                  <td style={{ padding: '9px 14px', fontWeight: 700, color: C.b }}>{row.habitacion}</td>
                  <td style={{ padding: '9px 14px', color: C.g9 }}>{row.inquilino}</td>
                  <td style={{ padding: '9px 14px', fontFamily: "'Fraunces', serif", fontWeight: 700, color: C.g9 }}>
                    {row.importe > 0 ? `${row.importe.toLocaleString()}€` : '—'}
                  </td>
                  <td style={{ padding: '9px 14px' }}>
                    <span style={{
                      background: row.estado === 'pagado' ? C.gl : row.estado === 'vencido' ? C.rl : C.yl,
                      color: row.estado === 'pagado' ? C.g : row.estado === 'vencido' ? C.r : C.y,
                      fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 7,
                    }}>{row.estado.toUpperCase()}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
