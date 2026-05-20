'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { C, card, cardHead, cardBody } from './tokens';

interface DashData {
  propiedades: number;
  unidades: number;
  ocupadas: number;
  alertas: AlertaRow[];
}

interface AlertaRow {
  id: string;
  mensaje?: string;
  prioridad?: string;
  tipo?: string;
}

function Skeleton({ h = 80 }: { h?: number }) {
  return (
    <div style={{ background: C.g1, borderRadius: 10, height: h, marginBottom: 14 }} />
  );
}

function KpiCard({ label, value, color, icon, sub }: { label: string; value: string | number; color: string; icon: string; sub?: string }) {
  return (
    <div style={{ ...card, marginBottom: 0, position: 'relative', overflow: 'hidden' }}>
      <div style={{ height: 3, background: color, position: 'absolute', top: 0, left: 0, right: 0 }} />
      <div style={{ padding: '16px 16px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 22 }}>{icon}</span>
          <span style={{ fontSize: 10, color: C.g5, fontWeight: 600, background: C.g1, borderRadius: 6, padding: '2px 7px' }}>{label}</span>
        </div>
        <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 28, color: C.g9, lineHeight: 1 }}>{value}</div>
        {sub && <div style={{ fontSize: 11, color: C.g5, marginTop: 4 }}>{sub}</div>}
      </div>
    </div>
  );
}

export default function SectionDashboard() {
  const [data, setData] = useState<DashData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const sb = createClient();
        const [r1, r2, r3, r4] = await Promise.all([
          sb.from('propiedades').select('*', { count: 'exact', head: true }),
          sb.from('unidades').select('*', { count: 'exact', head: true }),
          sb.from('unidades').select('*', { count: 'exact', head: true }).eq('estado', 'OCUPADA'),
          sb.from('v_alertas').select('*').limit(5),
        ]);
        setData({
          propiedades: r1.count ?? 0,
          unidades: r2.count ?? 0,
          ocupadas: r3.count ?? 0,
          alertas: (r4.data ?? []) as AlertaRow[],
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
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, marginBottom: 14 }}>
        {[1,2,3,4].map(i => <Skeleton key={i} h={90} />)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
        <Skeleton h={200} /><Skeleton h={200} />
      </div>
    </div>
  );

  if (error) return (
    <div style={{ background: C.rl, border: `1.5px solid ${C.r}`, borderRadius: 10, padding: 16, color: C.r }}>
      ⚠️ Error cargando datos del dashboard: {error}
    </div>
  );

  const altasCount = data?.alertas.filter(a => a.prioridad === 'alta').length ?? 2;
  const ocpPct = data && data.unidades ? Math.round((data.ocupadas / data.unidades) * 100) : 0;

  const pisoOcup = [
    { name: 'Sants 10', pct: 80, total: 6, ocp: 5 },
    { name: 'Bulevar Pirineus', pct: 70, total: 5, ocp: 4 },
    { name: 'Plaza de Palau', pct: 0, total: 4, ocp: 0 },
  ];

  const actividad = [
    { icon: '✅', text: 'Alejandro F. — Contrato firmado', time: 'hace 2h' },
    { icon: '⚠️', text: 'INC_20260415_001 — Avería caldera', time: 'hace 5h' },
    { icon: '📧', text: 'Email bienvenida WEL_02 enviado', time: 'ayer' },
    { icon: '💰', text: 'Transferencia recibida · Sants HAB3', time: 'ayer' },
  ];

  const makeScenarios = [
    { name: 'Esc. A · Captación', status: '✅ OK', ok: true },
    { name: 'Esc. B · Inquilino', status: '✅ OK', ok: true },
    { name: 'Esc. C · Incidencias', status: '⚠️ 2 pend.', ok: false },
    { name: 'Esc. D · Finanzas', status: '✅ OK', ok: true },
  ];

  const tareas = [
    { icon: '🔑', text: 'Check-in HAB5 Sants — 22 May', prio: 'alta' },
    { icon: '⚠️', text: 'Revisar caldera Pirineus', prio: 'alta' },
    { icon: '📝', text: 'Enviar contrato Jorge M.', prio: 'media' },
    { icon: '💰', text: 'Liquidación mayo propietario', prio: 'media' },
  ];

  const proyeccion = [
    { mes: 'Ene', val: 60 }, { mes: 'Feb', val: 75 }, { mes: 'Mar', val: 70 },
    { mes: 'Abr', val: 85 }, { mes: 'May', val: 90 }, { mes: 'Jun', val: 95 },
  ];
  const maxProy = Math.max(...proyeccion.map(p => p.val));

  return (
    <div>
      <style>{`
        @media(max-width:700px){
          .dash-grid-4{grid-template-columns:1fr 1fr!important}
          .dash-grid-2{grid-template-columns:1fr!important}
          .dash-grid-3{grid-template-columns:1fr!important}
        }
      `}</style>

      <div className="dash-grid-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
        <KpiCard label="Propiedades" value={data?.propiedades ?? 3} color={C.b} icon="🏘️" sub="pisos activos" />
        <KpiCard label="Habs ocupadas" value={`${data?.ocupadas ?? 9}/${data?.unidades ?? 15}`} color={C.g} icon="🛏️" sub={`${ocpPct || 75}% ocupación`} />
        <KpiCard label="Ingresos est." value="4.2k€" color={C.y} icon="💰" sub="mes en curso" />
        <KpiCard label="Incidencias altas" value={altasCount || 2} color={C.r} icon="⚠️" sub="requieren atención" />
      </div>

      <div className="dash-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        <div style={card}>
          <div style={cardHead}>🏘️ Estado de ocupación</div>
          <div style={cardBody}>
            {pisoOcup.map(p => (
              <div key={p.name} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 13, fontWeight: 600, color: C.g9 }}>
                  <span>{p.name}</span>
                  <span style={{ color: C.g5 }}>{p.ocp}/{p.total} habs · {p.pct}%</span>
                </div>
                <div style={{ height: 7, background: C.g1, borderRadius: 4 }}>
                  <div style={{ height: '100%', width: `${p.pct}%`, background: p.pct >= 75 ? C.g : p.pct > 0 ? C.y : C.r, borderRadius: 4, transition: 'width .4s' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={card}>
          <div style={cardHead}>⚡ Actividad reciente</div>
          <div style={cardBody}>
            {actividad.map((a, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: i < actividad.length - 1 ? `1px solid ${C.g1}` : 'none', alignItems: 'center' }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>{a.icon}</span>
                <div style={{ flex: 1, fontSize: 12.5, color: C.g9, fontWeight: 500 }}>{a.text}</div>
                <span style={{ fontSize: 11, color: C.g5, whiteSpace: 'nowrap' }}>{a.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="dash-grid-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
        <div style={card}>
          <div style={cardHead}>⚡ Sistema Make</div>
          <div style={cardBody}>
            {makeScenarios.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: i < makeScenarios.length - 1 ? `1px solid ${C.g1}` : 'none', fontSize: 13 }}>
                <span style={{ color: C.g9, fontWeight: 500 }}>{m.name}</span>
                <span style={{ color: m.ok ? C.g : C.y, fontWeight: 600 }}>{m.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={card}>
          <div style={cardHead}>📋 Tareas urgentes</div>
          <div style={cardBody}>
            {tareas.map((t, i) => (
              <div key={i} style={{ display: 'flex', gap: 9, padding: '7px 0', borderBottom: i < tareas.length - 1 ? `1px solid ${C.g1}` : 'none', alignItems: 'flex-start' }}>
                <span style={{ fontSize: 15, flexShrink: 0, marginTop: 1 }}>{t.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12.5, color: C.g9, marginBottom: 3 }}>{t.text}</div>
                  <span style={{ fontSize: 10, background: t.prio === 'alta' ? C.rl : C.yl, color: t.prio === 'alta' ? C.r : C.y, borderRadius: 6, padding: '1px 6px', fontWeight: 700 }}>{t.prio}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={card}>
          <div style={cardHead}>📈 Proyección 6 meses</div>
          <div style={cardBody}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 100 }}>
              {proyeccion.map((p, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: '100%', background: C.b, borderRadius: '4px 4px 0 0', height: `${(p.val / maxProy) * 80}px`, minHeight: 8 }} />
                  <span style={{ fontSize: 10, color: C.g5 }}>{p.mes}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 10, fontSize: 12, color: C.g5, textAlign: 'center' }}>Estimación ingresos (índice)</div>
          </div>
        </div>
      </div>
    </div>
  );
}

