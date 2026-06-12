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
  estancia_id: string | null;
  concepto: string | null;
  mes_facturado: string | null;
  fecha_vencimiento: string | null;
  fecha_pago: string | null;
  metodo_pago: string | null;
}

interface GastoDetalle {
  id: string;
  concepto: string;
  importe: number;
  mes: string | null;
  fecha_pago: string | null;
  propiedad_id: string | null;
  propiedad_nombre: string | null;
}

interface EstanciaSimple {
  id: string;
  label: string;
}

interface PropiedadSimple {
  id: string;
  nombre: string;
}

interface PagoForm {
  estancia_id: string;
  concepto: string;
  mes_facturado: string;
  importe: string;
  estado: string;
  fecha_vencimiento: string;
  fecha_pago: string;
  metodo_pago: string;
}

interface GastoForm {
  propiedad_id: string;
  concepto: string;
  importe: string;
  mes: string;
  fecha_pago: string;
}

const CAT_COLORS: Record<string, string> = {
  Alquiler: C.b, Limpieza: C.p, Suministros: C.y, Mantenimiento: C.g, Otros: C.g5,
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

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function currentMonthStr(): string {
  return new Date().toISOString().slice(0, 7);
}

const inp = {
  width: '100%', padding: '9px 12px', border: '1.5px solid #E2E6EF',
  borderRadius: 8, fontSize: 13, outline: 'none',
  boxSizing: 'border-box' as const, fontFamily: "'Plus Jakarta Sans', sans-serif",
};

const lbl = { display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 4 };

function PagoModal({ estancias, editData, onClose, onSaved }: {
  estancias: EstanciaSimple[];
  editData?: PagoDetalle | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!editData;
  const [form, setForm] = useState<PagoForm>(
    isEdit && editData
      ? {
          estancia_id: editData.estancia_id ?? '',
          concepto: editData.concepto ?? 'renta',
          mes_facturado: editData.mes_facturado ?? currentMonthStr(),
          importe: String(editData.importe),
          estado: editData.estado,
          fecha_vencimiento: editData.fecha_vencimiento ?? todayStr(),
          fecha_pago: editData.fecha_pago ?? '',
          metodo_pago: editData.metodo_pago ?? 'transferencia',
        }
      : {
          estancia_id: '', concepto: 'renta', mes_facturado: currentMonthStr(),
          importe: '', estado: 'PAGADO', fecha_vencimiento: todayStr(),
          fecha_pago: todayStr(), metodo_pago: 'transferencia',
        }
  );
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  function set(k: keyof PagoForm, v: string) {
    setForm((f: PagoForm) => {
      const next = { ...f, [k]: v };
      if (k === 'estado' && v !== 'PAGADO') next.fecha_pago = '';
      if (k === 'estado' && v === 'PAGADO' && !next.fecha_pago) next.fecha_pago = todayStr();
      return next;
    });
  }

  async function handleSave() {
    if (!form.importe) { setErr('El importe es obligatorio.'); return; }
    setSaving(true); setErr('');
    const sb = createClient();
    const payload = {
      estancia_id: form.estancia_id || null,
      concepto: form.concepto,
      mes_facturado: form.mes_facturado || null,
      importe: Number(form.importe),
      estado: form.estado,
      fecha_vencimiento: form.fecha_vencimiento || null,
      fecha_pago: form.fecha_pago || null,
      metodo_pago: form.metodo_pago || null,
    };
    if (isEdit && editData) {
      const { error } = await sb.from('pagos').update(payload).eq('id', editData.id);
      if (error) { setErr(error.message); setSaving(false); return; }
    } else {
      const id = 'PAG_' + Date.now().toString().slice(-8);
      const { error } = await sb.from('pagos').insert({ id, ...payload });
      if (error) { setErr(error.message); setSaving(false); return; }
    }
    setSaving(false); onSaved();
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: 'white', borderRadius: 16, width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 8px 40px rgba(30,77,183,0.18)' }}>
        <div style={{ padding: '20px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#1E4DB7' }}>
            {isEdit ? '✏️ Editar Pago' : '💳 Registrar Pago'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#9CA3AF', lineHeight: 1 }}>×</button>
        </div>
        <div style={{ padding: '16px 24px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={lbl}>Estancia</label>
              <select style={inp} value={form.estancia_id} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => set('estancia_id', e.target.value)}>
                <option value="">— Sin vincular —</option>
                {estancias.map((e: EstanciaSimple) => <option key={e.id} value={e.id}>{e.label}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Concepto</label>
              <select style={inp} value={form.concepto} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => set('concepto', e.target.value)}>
                <option value="renta">Renta</option>
                <option value="fianza">Fianza</option>
                <option value="upsell">Upsell</option>
                <option value="extra">Extra</option>
              </select>
            </div>
            <div>
              <label style={lbl}>Mes facturado</label>
              <input style={inp} type="month" value={form.mes_facturado} onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('mes_facturado', e.target.value)} />
            </div>
            <div>
              <label style={lbl}>Importe (€) *</label>
              <input style={inp} type="number" min="0" value={form.importe} onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('importe', e.target.value)} placeholder="850" />
            </div>
            <div>
              <label style={lbl}>Estado</label>
              <select style={inp} value={form.estado} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => set('estado', e.target.value)}>
                <option value="PAGADO">PAGADO</option>
                <option value="PENDIENTE">PENDIENTE</option>
              </select>
            </div>
            <div>
              <label style={lbl}>Método de pago</label>
              <select style={inp} value={form.metodo_pago} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => set('metodo_pago', e.target.value)}>
                <option value="transferencia">Transferencia</option>
                <option value="bizum">Bizum</option>
                <option value="domiciliacion">Domiciliación</option>
                <option value="efectivo">Efectivo</option>
              </select>
            </div>
            <div>
              <label style={lbl}>Fecha vencimiento</label>
              <input style={inp} type="date" value={form.fecha_vencimiento} onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('fecha_vencimiento', e.target.value)} />
            </div>
            {form.estado === 'PAGADO' && (
              <div>
                <label style={lbl}>Fecha pago</label>
                <input style={inp} type="date" value={form.fecha_pago} onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('fecha_pago', e.target.value)} />
              </div>
            )}
          </div>
          {err && <p style={{ margin: 0, color: '#EF4444', fontSize: 12, background: '#FEF2F2', padding: '8px 12px', borderRadius: 8 }}>{err}</p>}
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button onClick={onClose} style={{ flex: 1, padding: '11px', background: 'white', border: '1.5px solid #E2E6EF', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#6B7280' }}>Cancelar</button>
            <button onClick={handleSave} disabled={saving} style={{ flex: 2, padding: '11px', background: '#1E4DB7', color: 'white', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Registrar pago'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function GastoModal({ propiedades, editData, onClose, onSaved }: {
  propiedades: PropiedadSimple[];
  editData?: GastoDetalle | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!editData;
  const [form, setForm] = useState<GastoForm>(
    isEdit && editData
      ? {
          propiedad_id: editData.propiedad_id ?? '',
          concepto: editData.concepto,
          importe: String(editData.importe),
          mes: editData.mes ?? currentMonthStr(),
          fecha_pago: editData.fecha_pago ?? todayStr(),
        }
      : {
          propiedad_id: '', concepto: 'alquiler_propietario',
          importe: '', mes: currentMonthStr(), fecha_pago: todayStr(),
        }
  );
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  function set(k: keyof GastoForm, v: string) {
    setForm((f: GastoForm) => ({ ...f, [k]: v }));
  }

  async function handleSave() {
    if (!form.importe) { setErr('El importe es obligatorio.'); return; }
    setSaving(true); setErr('');
    const sb = createClient();
    const payload = {
      propiedad_id: form.propiedad_id || null,
      concepto: form.concepto,
      importe: Number(form.importe),
      mes: form.mes || null,
      fecha_pago: form.fecha_pago || null,
    };
    if (isEdit && editData) {
      const { error } = await sb.from('gastos').update(payload).eq('id', editData.id);
      if (error) { setErr(error.message); setSaving(false); return; }
    } else {
      const id = 'GAS_' + Date.now().toString().slice(-8);
      const { error } = await sb.from('gastos').insert({ id, ...payload });
      if (error) { setErr(error.message); setSaving(false); return; }
    }
    setSaving(false); onSaved();
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: 'white', borderRadius: 16, width: '100%', maxWidth: 460, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 8px 40px rgba(30,77,183,0.18)' }}>
        <div style={{ padding: '20px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#27AE60' }}>
            {isEdit ? '✏️ Editar Gasto' : '📉 Registrar Gasto'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#9CA3AF', lineHeight: 1 }}>×</button>
        </div>
        <div style={{ padding: '16px 24px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={lbl}>Propiedad</label>
              <select style={inp} value={form.propiedad_id} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => set('propiedad_id', e.target.value)}>
                <option value="">— Sin vincular —</option>
                {propiedades.map((p: PropiedadSimple) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Concepto</label>
              <select style={inp} value={form.concepto} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => set('concepto', e.target.value)}>
                <option value="alquiler_propietario">Alquiler propietario</option>
                <option value="limpieza">Limpieza</option>
                <option value="suministros">Suministros</option>
                <option value="reparacion">Reparación</option>
                <option value="seguro">Seguro</option>
                <option value="otros">Otros</option>
              </select>
            </div>
            <div>
              <label style={lbl}>Importe (€) *</label>
              <input style={inp} type="number" min="0" value={form.importe} onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('importe', e.target.value)} placeholder="500" />
            </div>
            <div>
              <label style={lbl}>Mes</label>
              <input style={inp} type="month" value={form.mes} onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('mes', e.target.value)} />
            </div>
            <div>
              <label style={lbl}>Fecha pago</label>
              <input style={inp} type="date" value={form.fecha_pago} onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('fecha_pago', e.target.value)} />
            </div>
          </div>
          {err && <p style={{ margin: 0, color: '#EF4444', fontSize: 12, background: '#FEF2F2', padding: '8px 12px', borderRadius: 8 }}>{err}</p>}
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button onClick={onClose} style={{ flex: 1, padding: '11px', background: 'white', border: '1.5px solid #E2E6EF', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#6B7280' }}>Cancelar</button>
            <button onClick={handleSave} disabled={saving} style={{ flex: 2, padding: '11px', background: '#27AE60', color: 'white', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Registrar gasto'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SectionFinanzas() {
  const [meses, setMeses] = useState<MesData[]>([]);
  const [breakdown, setBreakdown] = useState<GastoCategoria[]>([]);
  const [pagosDetalle, setPagosDetalle] = useState<PagoDetalle[]>([]);
  const [gastosDetalle, setGastosDetalle] = useState<GastoDetalle[]>([]);
  const [estancias, setEstancias] = useState<EstanciaSimple[]>([]);
  const [propiedades, setPropiedades] = useState<PropiedadSimple[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMes, setSelectedMes] = useState(0);
  const [pagoModal, setPagoModal] = useState(false);
  const [gastoModal, setGastoModal] = useState(false);
  const [editPago, setEditPago] = useState<PagoDetalle | null>(null);
  const [editGasto, setEditGasto] = useState<GastoDetalle | null>(null);

  async function load() {
    try {
      const sb = createClient();

      const [pagosRes, gastosRes, pagosDetRes, gastosDetRes, estanciasRes, propiedadesRes] = await Promise.all([
        sb.from('pagos').select('importe, fecha_vencimiento, estado'),
        sb.from('gastos').select('importe, fecha_pago, mes, concepto'),
        sb.from('pagos').select(
          'id, estancia_id, concepto, importe, fecha_vencimiento, fecha_pago, estado, mes_facturado, metodo_pago, estancias(inquilinos(nombre, apellidos), unidades(nombre, propiedades(nombre)))'
        ).order('fecha_vencimiento', { ascending: false }).limit(15),
        sb.from('gastos').select('id, concepto, importe, mes, fecha_pago, propiedad_id, propiedades(nombre)').order('fecha_pago', { ascending: false }).limit(15),
        sb.from('estancias').select('id, inquilinos(nombre, apellidos), unidades(nombre)').eq('estado', 'ACTIVA'),
        sb.from('propiedades').select('id, nombre').order('nombre'),
      ]);

      // P&L por mes
      const ingMap: Record<string, number> = {};
      for (const p of (pagosRes.data ?? [])) {
        if ((p as { estado: string }).estado === 'PAGADO') {
          const key = (p as { fecha_vencimiento: string }).fecha_vencimiento.substring(0, 7);
          ingMap[key] = (ingMap[key] ?? 0) + Number((p as { importe: string }).importe);
        }
      }
      const gastMap: Record<string, number> = {};
      for (const g of (gastosRes.data ?? [])) {
        const key = (g as { mes: string; fecha_pago: string }).mes
          || (g as { mes: string; fecha_pago: string }).fecha_pago?.substring(0, 7)
          || '';
        if (!key) continue;
        gastMap[key] = (gastMap[key] ?? 0) + Number((g as { importe: string }).importe);
      }
      const allMonths = [...new Set([...Object.keys(ingMap), ...Object.keys(gastMap)])].sort().reverse();
      const mesesData: MesData[] = allMonths.map(k => ({
        mes: mesLabel(k), mes_key: k,
        ingresos: ingMap[k] ?? 0, gastos: gastMap[k] ?? 0,
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
        id: string; estancia_id: string | null; concepto: string | null;
        importe: string | number; fecha_vencimiento: string | null;
        fecha_pago: string | null; estado: string; mes_facturado: string | null;
        metodo_pago: string | null;
        estancias: {
          inquilinos: { nombre: string; apellidos: string | null } | null;
          unidades: { nombre: string; propiedades: { nombre: string } | null } | null;
        } | null;
      };
      const detData: PagoDetalle[] = ((pagosDetRes.data ?? []) as unknown as PagoRaw[]).map(p => {
        const inq = p.estancias?.inquilinos;
        return {
          id: p.id,
          inquilino: inq ? [inq.nombre, inq.apellidos].filter(Boolean).join(' ') : '—',
          habitacion: p.estancias?.unidades?.nombre ?? '—',
          propiedad: p.estancias?.unidades?.propiedades?.nombre ?? '—',
          importe: Number(p.importe),
          estado: p.estado,
          estancia_id: p.estancia_id,
          concepto: p.concepto,
          mes_facturado: p.mes_facturado,
          fecha_vencimiento: p.fecha_vencimiento,
          fecha_pago: p.fecha_pago,
          metodo_pago: p.metodo_pago,
        };
      });

      // Detalle gastos recientes
      type GastoRaw = {
        id: string; concepto: string; importe: string | number;
        mes: string | null; fecha_pago: string | null;
        propiedad_id: string | null;
        propiedades: { nombre: string }[] | { nombre: string } | null;
      };
      const gastosDetData: GastoDetalle[] = ((gastosDetRes.data ?? []) as unknown as GastoRaw[]).map(g => {
        const propNombre = Array.isArray(g.propiedades)
          ? (g.propiedades[0]?.nombre ?? null)
          : (g.propiedades?.nombre ?? null);
        return {
          id: g.id,
          concepto: g.concepto,
          importe: Number(g.importe),
          mes: g.mes,
          fecha_pago: g.fecha_pago,
          propiedad_id: g.propiedad_id,
          propiedad_nombre: propNombre,
        };
      });

      // Estancias para select de pagos
      type EstanciaRaw = {
        id: string;
        inquilinos: { nombre: string; apellidos: string | null } | null;
        unidades: { nombre: string } | null;
      };
      const estData: EstanciaSimple[] = ((estanciasRes.data ?? []) as unknown as EstanciaRaw[]).map(e => {
        const inq = e.inquilinos;
        const nombre = inq ? [inq.nombre, inq.apellidos].filter(Boolean).join(' ') : 'Sin inquilino';
        return { id: e.id, label: `${nombre} · ${e.unidades?.nombre ?? e.id}` };
      });

      setMeses(mesesData);
      setBreakdown(breakdownData);
      setPagosDetalle(detData);
      setGastosDetalle(gastosDetData);
      setEstancias(estData);
      setPropiedades((propiedadesRes.data ?? []) as PropiedadSimple[]);
    } catch (e) {
      console.error('SectionFinanzas:', e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function eliminarPago(id: string) {
    if (!confirm('¿Seguro que quieres eliminar este pago?')) return;
    const sb = createClient();
    await sb.from('pagos').delete().eq('id', id);
    await load();
  }

  async function eliminarGasto(id: string) {
    if (!confirm('¿Seguro que quieres eliminar este gasto?')) return;
    const sb = createClient();
    await sb.from('gastos').delete().eq('id', id);
    await load();
  }

  function abrirEditPago(p: PagoDetalle) {
    setEditPago(p);
    setPagoModal(true);
  }

  function abrirEditGasto(g: GastoDetalle) {
    setEditGasto(g);
    setGastoModal(true);
  }

  function cerrarPagoModal() {
    setPagoModal(false);
    setEditPago(null);
  }

  function cerrarGastoModal() {
    setGastoModal(false);
    setEditGasto(null);
  }

  const totalIngresos = meses.reduce((a: number, m: MesData) => a + m.ingresos, 0);
  const totalGastos = meses.reduce((a: number, m: MesData) => a + m.gastos, 0);
  const totalBeneficio = meses.reduce((a: number, m: MesData) => a + m.beneficio, 0);
  const maxVal = meses.length > 0 ? Math.max(...meses.map((m: MesData) => Math.max(m.ingresos, m.gastos, 1))) : 1;

  const btnAcc = { background: '#F3F4F6', color: '#6B7280', border: 'none', borderRadius: 6, width: 26, height: 26, fontSize: 12, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' };

  if (loading) return (
    <div>{[1, 2, 3].map(i => <div key={i} style={{ background: C.g1, borderRadius: 10, height: 80, marginBottom: 12 }} />)}</div>
  );

  return (
    <div>
      <style>{`@media(max-width:700px){.fin-kpi{grid-template-columns:1fr 1fr!important}.fin-grid{grid-template-columns:1fr!important}}`}</style>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginBottom: 14 }}>
        <button
          onClick={() => { setEditPago(null); setPagoModal(true); }}
          style={{ padding: '8px 16px', background: '#1E4DB7', color: 'white', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
        >
          + Registrar Pago
        </button>
        <button
          onClick={() => { setEditGasto(null); setGastoModal(true); }}
          style={{ padding: '8px 16px', background: '#27AE60', color: 'white', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
        >
          + Registrar Gasto
        </button>
      </div>

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

      {/* Tabla Pagos */}
      <div style={{ ...card, marginBottom: 14 }}>
        <div style={cardHead}>💳 Pagos recientes</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: C.g0 }}>
                {['Propiedad', 'Habitación', 'Inquilino', 'Importe', 'Estado', ''].map(h => (
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
                      background: row.estado === 'PAGADO' || row.estado === 'pagado' ? C.gl : row.estado === 'VENCIDO' || row.estado === 'vencido' ? C.rl : C.yl,
                      color: row.estado === 'PAGADO' || row.estado === 'pagado' ? C.g : row.estado === 'VENCIDO' || row.estado === 'vencido' ? C.r : C.y,
                      fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 7,
                    }}>{row.estado.toUpperCase()}</span>
                  </td>
                  <td style={{ padding: '9px 14px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        style={{ ...btnAcc, background: '#F0F4FF', color: C.b }}
                        onClick={() => abrirEditPago(row)}
                        title="Editar"
                        onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => { (e.currentTarget as HTMLButtonElement).style.background = C.bl; }}
                        onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => { (e.currentTarget as HTMLButtonElement).style.background = '#F0F4FF'; }}
                      >✏️</button>
                      <button
                        style={btnAcc}
                        onClick={() => eliminarPago(row.id)}
                        title="Eliminar"
                        onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => { const el = e.currentTarget as HTMLButtonElement; el.style.background = '#FEE2E2'; el.style.color = '#EF4444'; }}
                        onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => { const el = e.currentTarget as HTMLButtonElement; el.style.background = '#F3F4F6'; el.style.color = '#6B7280'; }}
                      >✕</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tabla Gastos */}
      <div style={card}>
        <div style={cardHead}>📉 Gastos recientes</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: C.g0 }}>
                {['Concepto', 'Propiedad', 'Mes', 'Importe', ''].map(h => (
                  <th key={h} style={{ padding: '9px 14px', textAlign: 'left', color: C.g5, fontWeight: 600, borderBottom: `1px solid ${C.bd}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {gastosDetalle.map((row: GastoDetalle) => (
                <tr key={row.id} style={{ borderBottom: `1px solid ${C.g1}` }}>
                  <td style={{ padding: '9px 14px', color: C.g9, textTransform: 'capitalize' }}>{row.concepto.replace(/_/g, ' ')}</td>
                  <td style={{ padding: '9px 14px', color: C.g5 }}>{row.propiedad_nombre ?? '—'}</td>
                  <td style={{ padding: '9px 14px', color: C.g5 }}>{row.mes ? mesLabel(row.mes) : '—'}</td>
                  <td style={{ padding: '9px 14px', fontFamily: "'Fraunces', serif", fontWeight: 700, color: C.r }}>
                    {row.importe > 0 ? `${row.importe.toLocaleString()}€` : '—'}
                  </td>
                  <td style={{ padding: '9px 14px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        style={{ ...btnAcc, background: '#F0F4FF', color: C.b }}
                        onClick={() => abrirEditGasto(row)}
                        title="Editar"
                        onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => { (e.currentTarget as HTMLButtonElement).style.background = C.bl; }}
                        onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => { (e.currentTarget as HTMLButtonElement).style.background = '#F0F4FF'; }}
                      >✏️</button>
                      <button
                        style={btnAcc}
                        onClick={() => eliminarGasto(row.id)}
                        title="Eliminar"
                        onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => { const el = e.currentTarget as HTMLButtonElement; el.style.background = '#FEE2E2'; el.style.color = '#EF4444'; }}
                        onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => { const el = e.currentTarget as HTMLButtonElement; el.style.background = '#F3F4F6'; el.style.color = '#6B7280'; }}
                      >✕</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {pagoModal && (
        <PagoModal
          estancias={estancias}
          editData={editPago}
          onClose={cerrarPagoModal}
          onSaved={() => { cerrarPagoModal(); load(); }}
        />
      )}
      {gastoModal && (
        <GastoModal
          propiedades={propiedades}
          editData={editGasto}
          onClose={cerrarGastoModal}
          onSaved={() => { cerrarGastoModal(); load(); }}
        />
      )}
    </div>
  );
}
