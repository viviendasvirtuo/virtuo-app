'use client';
import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { C, card } from './tokens';

interface Estancia {
  id: string;
  estado: string | null;
  fecha_entrada: string | null;
  fecha_salida_prevista: string | null;
  renta_mensual: number | null;
  fianza: number | null;
  unidad_id: string | null;
  inquilino_id: string | null;
  checkin_completado: boolean | null;
  checkout_completado: boolean | null;
  dia_pago: number | null;
  tipo_contrato: string | null;
}

interface Inquilino {
  id: string;
  nombre: string;
  apellidos: string | null;
}

interface Unidad {
  id: string;
  nombre: string;
  estado: string | null;
  propiedad_id: string | null;
  propiedades: { nombre: string } | null;
}

interface EstanciaForm {
  inquilino_id: string;
  unidad_id: string;
  estado: string;
  fecha_entrada: string;
  fecha_salida_prevista: string;
  renta_mensual: string;
  fianza: string;
  dia_pago: string;
  tipo_contrato: string;
}

interface UpsellForm {
  pack: 'ninguno' | 'basic' | 'premium' | 'vip';
  fee_activacion: boolean;
  late_checkout: boolean;
  upgrade_colchon: boolean;
  limpieza_quincenal: boolean;
  parking: boolean;
}

const EMPTY_UPSELL: UpsellForm = {
  pack: 'ninguno',
  fee_activacion: false,
  late_checkout: false,
  upgrade_colchon: false,
  limpieza_quincenal: false,
  parking: false,
};

const EMPTY_FORM: EstanciaForm = {
  inquilino_id: '',
  unidad_id: '',
  estado: 'RESERVA',
  fecha_entrada: '',
  fecha_salida_prevista: '',
  renta_mensual: '',
  fianza: '',
  dia_pago: '1',
  tipo_contrato: 'coliving',
};

const inp = {
  width: '100%',
  padding: '9px 12px',
  border: '1.5px solid #E2E6EF',
  borderRadius: 8,
  fontSize: 13,
  outline: 'none',
  boxSizing: 'border-box' as const,
  fontFamily: "'Plus Jakarta Sans', sans-serif",
};

const lbl = {
  display: 'block',
  fontSize: 11,
  fontWeight: 600,
  color: '#374151',
  marginBottom: 4,
};

const ESTADO_STYLE: Record<string, { bg: string; color: string }> = {
  ACTIVA:     { bg: '#D1FAE5', color: '#27AE60' },
  RESERVA:    { bg: '#FEF3C7', color: '#F59E0B' },
  CONTRATO:   { bg: '#DBEAFE', color: '#1E4DB7' },
  FINALIZADA: { bg: '#F3F4F6', color: '#6B7280' },
  CANCELADA:  { bg: '#FEE2E2', color: '#EF4444' },
};

function fmt(d: string | null): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: '2-digit' });
}

function EstanciaModal({
  inquilinos,
  unidades,
  onClose,
  onSaved,
  editData,
}: {
  inquilinos: Inquilino[];
  unidades: Unidad[];
  onClose: () => void;
  onSaved: () => void;
  editData?: Estancia | null;
}) {
  const isEdit = !!editData;
  const [form, setForm] = useState<EstanciaForm>(() =>
    editData
      ? {
          inquilino_id: editData.inquilino_id ?? '',
          unidad_id: editData.unidad_id ?? '',
          estado: editData.estado ?? 'RESERVA',
          fecha_entrada: editData.fecha_entrada ?? '',
          fecha_salida_prevista: editData.fecha_salida_prevista ?? '',
          renta_mensual: editData.renta_mensual != null ? String(editData.renta_mensual) : '',
          fianza: editData.fianza != null ? String(editData.fianza) : '',
          dia_pago: editData.dia_pago != null ? String(editData.dia_pago) : '1',
          tipo_contrato: editData.tipo_contrato ?? 'coliving',
        }
      : EMPTY_FORM
  );
  const [upsell, setUpsell] = useState<UpsellForm>(EMPTY_UPSELL);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  function set(k: keyof EstanciaForm, v: string) {
    setForm((f: EstanciaForm) => ({ ...f, [k]: v }));
  }
  function setU(k: keyof UpsellForm, v: boolean | string) {
    setUpsell((u: UpsellForm) => ({ ...u, [k]: v }));
  }

  async function handleSave() {
    if (!form.fecha_entrada) { setErr('La fecha de entrada es obligatoria.'); return; }
    if (!form.renta_mensual) { setErr('La renta mensual es obligatoria.'); return; }
    setSaving(true);
    setErr('');
    const sb = createClient();

    if (isEdit && editData) {
      const payload = {
        inquilino_id: form.inquilino_id || null,
        unidad_id: form.unidad_id || null,
        estado: form.estado,
        fecha_entrada: form.fecha_entrada,
        fecha_salida_prevista: form.fecha_salida_prevista || null,
        renta_mensual: Number(form.renta_mensual),
        fianza: form.fianza ? Number(form.fianza) : null,
        dia_pago: form.dia_pago ? Number(form.dia_pago) : 1,
        tipo_contrato: form.tipo_contrato,
      };
      const { error } = await sb.from('estancias').update(payload).eq('id', editData.id);
      if (error) { setErr(error.message); setSaving(false); return; }
      if (form.estado === 'ACTIVA' && form.unidad_id) {
        await sb.from('unidades').update({ estado: 'OCUPADA' }).eq('id', form.unidad_id);
      }
      setSaving(false);
      onSaved();
      return;
    }

    const id = 'EST_' + Date.now().toString().slice(-8);
    const payload = {
      id,
      inquilino_id: form.inquilino_id || null,
      unidad_id: form.unidad_id || null,
      estado: form.estado,
      fecha_entrada: form.fecha_entrada,
      fecha_salida_prevista: form.fecha_salida_prevista || null,
      renta_mensual: Number(form.renta_mensual),
      fianza: form.fianza ? Number(form.fianza) : null,
      dia_pago: form.dia_pago ? Number(form.dia_pago) : 1,
      tipo_contrato: form.tipo_contrato,
      checkin_completado: false,
      checkout_completado: false,
    };

    const { error } = await sb.from('estancias').insert(payload);
    if (error) { setErr(error.message); setSaving(false); return; }

    if (form.estado === 'ACTIVA' && form.unidad_id) {
      await sb.from('unidades').update({ estado: 'OCUPADA' }).eq('id', form.unidad_id);
    }

    // Insert upsells
    const now = new Date().toISOString();
    const upsells: { id: string; estancia_id: string; tipo: string; descripcion: string; precio: number; estado: string; fecha_solicitud: string }[] = [];
    const ts = Date.now();
    if (upsell.pack !== 'ninguno') {
      const packMap = {
        basic:   { precio: 350, descripcion: 'Pack Basic · Muebles + TV + WiFi 1GB + Mant. 24/7' },
        premium: { precio: 550, descripcion: 'Pack Premium · Todo Basic + Netflix + Coffee Room + Limpieza' },
        vip:     { precio: 650, descripcion: 'Pack VIP · Todo Premium + Gym + Lavandería + Limpieza Hab. Semanal' },
      };
      const p = packMap[upsell.pack];
      upsells.push({ id: `UPS_${ts}_pack_${upsell.pack}`, estancia_id: id, tipo: `pack_${upsell.pack}`, descripcion: p.descripcion, precio: p.precio, estado: 'ACTIVO', fecha_solicitud: now });
    }
    if (upsell.fee_activacion) {
      upsells.push({ id: `UPS_${ts}_fee_activacion`, estancia_id: id, tipo: 'fee_activacion', descripcion: 'Fee Activación · Onboarding + Kit Welcome + Limpieza Final + Soporte VIP', precio: 250, estado: 'PENDIENTE', fecha_solicitud: now });
    }
    if (upsell.late_checkout) {
      upsells.push({ id: `UPS_${ts}_late_checkout`, estancia_id: id, tipo: 'late_checkout', descripcion: 'Late Check-out / Early Check-in', precio: 50, estado: 'PENDIENTE', fecha_solicitud: now });
    }
    if (upsell.upgrade_colchon) {
      upsells.push({ id: `UPS_${ts}_upgrade_colchon`, estancia_id: id, tipo: 'upgrade_colchon', descripcion: 'Upgrade Colchón Viscoelástico', precio: 50, estado: 'PENDIENTE', fecha_solicitud: now });
    }
    if (upsell.limpieza_quincenal) {
      upsells.push({ id: `UPS_${ts}_limpieza_quincenal`, estancia_id: id, tipo: 'limpieza_quincenal', descripcion: 'Limpieza Quincenal +80€/mes', precio: 80, estado: 'PENDIENTE', fecha_solicitud: now });
    }
    if (upsell.parking) {
      upsells.push({ id: `UPS_${ts}_parking`, estancia_id: id, tipo: 'parking', descripcion: 'Plaza Parking +120€/mes', precio: 120, estado: 'PENDIENTE', fecha_solicitud: now });
    }
    if (upsells.length > 0) {
      await sb.from('upsells').insert(upsells);
    }

    setSaving(false);
    onSaved();
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: 'white', borderRadius: 16, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 8px 40px rgba(30,77,183,0.18)' }}>
        <div style={{ padding: '20px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#1E4DB7' }}>{isEdit ? '✏️ Editar estancia' : '🏠 Nueva reserva'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#9CA3AF', lineHeight: 1 }}>×</button>
        </div>
        <div style={{ padding: '16px 24px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={lbl}>Inquilino</label>
              <select style={inp} value={form.inquilino_id} onChange={(e: { target: { value: string } }) => set('inquilino_id', e.target.value)} disabled={!isEdit && inquilinos.length === 0}>
                {!isEdit && inquilinos.length === 0
                  ? <option value="">— No hay inquilinos disponibles —</option>
                  : <option value="">— Sin asignar —</option>
                }
                {inquilinos.map((inq: Inquilino) => (
                  <option key={inq.id} value={inq.id}>
                    {inq.nombre}{inq.apellidos ? ' ' + inq.apellidos : ''}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={lbl}>Habitación</label>
              <select style={inp} value={form.unidad_id} onChange={(e: { target: { value: string } }) => set('unidad_id', e.target.value)}>
                <option value="">— Sin asignar —</option>
                {unidades.map((u: Unidad) => (
                  <option key={u.id} value={u.id}>
                    {u.propiedades?.nombre ? u.propiedades.nombre + ' · ' : ''}{u.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={lbl}>Estado</label>
              <select style={inp} value={form.estado} onChange={(e: { target: { value: string } }) => set('estado', e.target.value)}>
                <option value="RESERVA">RESERVA</option>
                <option value="CONTRATO">CONTRATO</option>
                <option value="ACTIVA">ACTIVA</option>
              </select>
            </div>
            <div>
              <label style={lbl}>Tipo contrato</label>
              <select style={inp} value={form.tipo_contrato} onChange={(e: { target: { value: string } }) => set('tipo_contrato', e.target.value)}>
                <option value="coliving">Coliving · Código Civil</option>
                <option value="temporal">Temporal · Media estancia</option>
                <option value="turistico">Turístico · HUTB Barcelona</option>
              </select>
            </div>
            <div>
              <label style={lbl}>Fecha entrada *</label>
              <input style={inp} type="date" value={form.fecha_entrada} onChange={(e: { target: { value: string } }) => set('fecha_entrada', e.target.value)} />
            </div>
            <div>
              <label style={lbl}>Salida prevista</label>
              <input style={inp} type="date" value={form.fecha_salida_prevista} onChange={(e: { target: { value: string } }) => set('fecha_salida_prevista', e.target.value)} />
            </div>
            <div>
              <label style={lbl}>Renta mensual (€) *</label>
              <input style={inp} type="number" min="0" value={form.renta_mensual} onChange={(e: { target: { value: string } }) => set('renta_mensual', e.target.value)} placeholder="850" />
            </div>
            <div>
              <label style={lbl}>Fianza (€)</label>
              <input style={inp} type="number" min="0" value={form.fianza} onChange={(e: { target: { value: string } }) => set('fianza', e.target.value)} placeholder="850" />
            </div>
            <div>
              <label style={lbl}>Día de pago</label>
              <select style={inp} value={form.dia_pago} onChange={(e: { target: { value: string } }) => set('dia_pago', e.target.value)}>
                {Array.from({ length: 28 }, (_, i) => i + 1).map(d => (
                  <option key={d} value={d}>Día {d}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Servicios y Packs */}
          {!isEdit && <div style={{ background: '#F0F4FF', borderRadius: 8, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1E4DB7', marginBottom: 2 }}>⭐ Servicios y Packs</div>

            <div>
              <label style={lbl}>Pack mensual</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {([
                  ['ninguno', 'Sin pack mensual'],
                  ['basic', 'Pack Basic +350€/mes · Muebles + TV + WiFi 1GB + Mant. 24/7'],
                  ['premium', 'Pack Premium +550€/mes · Todo Basic + Netflix + Coffee Room + Limpieza'],
                  ['vip', 'Pack VIP +650€/mes · Todo Premium + Gym + Lavandería + Limpieza Hab. Semanal'],
                ] as [string, string][]).map(([val, label]) => (
                  <label key={val} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12.5, color: '#374151', cursor: 'pointer', fontWeight: upsell.pack === val ? 600 : 400 }}>
                    <input type="radio" name="pack" value={val} checked={upsell.pack === val} onChange={() => setU('pack', val)} style={{ marginTop: 2, flexShrink: 0 }} />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label style={lbl}>Fee de activación</label>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12.5, color: '#374151', cursor: 'pointer', fontWeight: upsell.fee_activacion ? 600 : 400 }}>
                <input type="checkbox" checked={upsell.fee_activacion} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setU('fee_activacion', e.target.checked)} style={{ marginTop: 2, flexShrink: 0 }} />
                Fee Activación 250€ único · Onboarding + Kit Welcome + Limpieza Final + Soporte VIP
              </label>
            </div>

            <div>
              <label style={lbl}>Servicios extra</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {([
                  ['late_checkout', 'Late Check-out / Early Check-in 50€ único'],
                  ['upgrade_colchon', 'Upgrade Colchón Viscoelástico 50€ único'],
                  ['limpieza_quincenal', 'Limpieza Quincenal +80€/mes'],
                  ['parking', 'Plaza Parking +120€/mes'],
                ] as [keyof UpsellForm, string][]).map(([key, label]) => (
                  <label key={key} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12.5, color: '#374151', cursor: 'pointer', fontWeight: upsell[key] ? 600 : 400 }}>
                    <input type="checkbox" checked={upsell[key] as boolean} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setU(key, e.target.checked)} style={{ marginTop: 2, flexShrink: 0 }} />
                    {label}
                  </label>
                ))}
              </div>
            </div>
          </div>}

          {err && <p style={{ margin: 0, color: '#EF4444', fontSize: 12, background: '#FEF2F2', padding: '8px 12px', borderRadius: 8 }}>{err}</p>}

          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button onClick={onClose} style={{ flex: 1, padding: '11px', background: 'white', border: '1.5px solid #E2E6EF', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#6B7280' }}>
              Cancelar
            </button>
            <button onClick={handleSave} disabled={saving} style={{ flex: 2, padding: '11px', background: '#1E4DB7', color: 'white', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear estancia'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface BajaForm {
  fecha_salida_real: string;
  checkout_completado: boolean;
  fianza_devuelta: boolean;
  fianza_devuelta_fecha: string;
}

function BajaModal({
  estancia,
  onClose,
  onSaved,
}: {
  estancia: Estancia;
  onClose: () => void;
  onSaved: () => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState<BajaForm>({
    fecha_salida_real: today,
    checkout_completado: false,
    fianza_devuelta: false,
    fianza_devuelta_fecha: today,
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const canConfirm = form.fianza_devuelta && !!form.fianza_devuelta_fecha;

  async function handleConfirmar() {
    setSaving(true);
    setErr('');
    const sb = createClient();
    const { error } = await sb.from('estancias').update({
      estado: 'FINALIZADA',
      fecha_salida_real: form.fecha_salida_real || null,
      checkout_completado: form.checkout_completado,
      fianza_devuelta: true,
      fianza_devuelta_fecha: form.fianza_devuelta_fecha,
    }).eq('id', estancia.id);
    if (error) { setErr(error.message); setSaving(false); return; }
    if (estancia.unidad_id) {
      await sb.from('unidades').update({ estado: 'LIBRE' }).eq('id', estancia.unidad_id);
    }
    setSaving(false);
    onSaved();
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: 'white', borderRadius: 16, width: '100%', maxWidth: 440, boxShadow: '0 8px 40px rgba(30,77,183,0.18)' }}>
        <div style={{ padding: '20px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#EF4444' }}>🚪 Dar de baja</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#9CA3AF', lineHeight: 1 }}>×</button>
        </div>
        <div style={{ padding: '16px 24px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={lbl}>Fecha de salida real</label>
            <input style={inp} type="date" value={form.fecha_salida_real} onChange={(e: { target: { value: string } }) => setForm(f => ({ ...f, fecha_salida_real: e.target.value }))} />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#374151', cursor: 'pointer' }}>
            <input type="checkbox" checked={form.checkout_completado} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, checkout_completado: e.target.checked }))} />
            Checkout completado
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#374151', cursor: 'pointer', fontWeight: form.fianza_devuelta ? 700 : 400 }}>
            <input type="checkbox" checked={form.fianza_devuelta} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, fianza_devuelta: e.target.checked }))} />
            Fianza devuelta *
          </label>
          {form.fianza_devuelta && (
            <div>
              <label style={lbl}>Fecha devolución fianza *</label>
              <input style={inp} type="date" value={form.fianza_devuelta_fecha} onChange={(e: { target: { value: string } }) => setForm(f => ({ ...f, fianza_devuelta_fecha: e.target.value }))} />
            </div>
          )}
          {err && <p style={{ margin: 0, color: '#EF4444', fontSize: 12, background: '#FEF2F2', padding: '8px 12px', borderRadius: 8 }}>{err}</p>}
          {!canConfirm && <p style={{ margin: 0, color: '#6B7280', fontSize: 12 }}>Marca "Fianza devuelta" y añade la fecha para confirmar.</p>}
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={onClose} style={{ flex: 1, padding: '11px', background: 'white', border: '1.5px solid #E2E6EF', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#6B7280' }}>
              Cancelar
            </button>
            <button onClick={handleConfirmar} disabled={saving || !canConfirm} style={{ flex: 2, padding: '11px', background: canConfirm ? '#EF4444' : '#F3F4F6', color: canConfirm ? 'white' : '#9CA3AF', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: canConfirm ? 'pointer' : 'default' }}>
              {saving ? 'Procesando...' : 'Confirmar baja'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SectionCheckins() {
  const [estancias, setEstancias] = useState<Estancia[]>([]);
  const [inquilinos, setInquilinos] = useState<Inquilino[]>([]);
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [checkingIn, setCheckingIn] = useState<string | null>(null);
  const [editEstancia, setEditEstancia] = useState<Estancia | null>(null);
  const [bajaEstancia, setBajaEstancia] = useState<Estancia | null>(null);

  const inqMap: Record<string, Inquilino> = {};
  for (const inq of inquilinos) inqMap[inq.id] = inq;
  const unidadMap: Record<string, Unidad> = {};
  for (const u of unidades) unidadMap[u.id] = u;

  async function load() {
    setLoading(true);
    const sb = createClient();

    const [estRes, inqRes, uniRes] = await Promise.all([
      sb.from('estancias')
        .select('id, estado, fecha_entrada, fecha_salida_prevista, renta_mensual, fianza, unidad_id, inquilino_id, checkin_completado, checkout_completado, dia_pago, tipo_contrato')
        .order('fecha_entrada', { ascending: false }),
      sb.from('inquilinos')
        .select('id, nombre, apellidos')
        .order('nombre'),
      sb.from('unidades')
        .select('id, nombre, estado, propiedad_id, propiedades(nombre)')
        .or('estado.eq.LIBRE,estado.eq.OCUPADA')
        .order('nombre'),
    ]);

    if (estRes.error) { setDbError(estRes.error.message); setLoading(false); return; }

    setEstancias((estRes.data ?? []) as Estancia[]);
    setInquilinos((inqRes.data ?? []) as Inquilino[]);
    setUnidades((uniRes.data ?? []) as unknown as Unidad[]);
    setDbError(null);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function abrirBaja(est: Estancia) {
    const sb = createClient();
    const { data: pagosPendientes } = await sb
      .from('pagos')
      .select('id')
      .eq('estancia_id', est.id)
      .in('estado', ['PENDIENTE', 'VENCIDO']);
    const n = pagosPendientes?.length ?? 0;
    if (n > 0) {
      alert(`No se puede dar de baja: hay ${n} pago(s) pendiente(s)/vencido(s). Resuélvelos en Finanzas primero.`);
      return;
    }
    setBajaEstancia(est);
  }

  async function eliminarEstancia(id: string) {
    if (!confirm('¿Seguro que quieres eliminar esta estancia?')) return;
    const sb = createClient();
    const { error } = await sb.from('estancias').delete().eq('id', id);
    if (error) alert(error.message); else load();
  }

  async function handleCheckin(id: string) {
    setCheckingIn(id);
    const sb = createClient();
    await sb.from('estancias').update({ checkin_completado: true }).eq('id', id);
    setCheckingIn(null);
    load();
  }

  const ocupadosIds = new Set(
    estancias
      .filter((e: Estancia) => ['ACTIVA', 'CONTRATO', 'RESERVA'].includes(e.estado ?? ''))
      .map((e: Estancia) => e.inquilino_id)
      .filter(Boolean) as string[]
  );
  const inquilinosDisponibles = inquilinos.filter((i: Inquilino) => !ocupadosIds.has(i.id));
  const unidadesLibres = unidades.filter((u: Unidad) => u.estado === 'LIBRE');

  return (
    <div>
      <style>{`@media(max-width:700px){.chk-tbl th:nth-child(3),.chk-tbl td:nth-child(3),.chk-tbl th:nth-child(4),.chk-tbl td:nth-child(4){display:none}}`}</style>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
        <button
          onClick={() => { setEditEstancia(null); setModalOpen(true); }}
          style={{ padding: '8px 18px', background: '#1E4DB7', color: 'white', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
        >
          + Nueva Reserva
        </button>
      </div>

      <div style={card}>
        {loading && <div style={{ padding: 24, color: C.g5, fontSize: 14 }}>Cargando estancias…</div>}

        {!loading && dbError && (
          <div style={{ padding: '16px 20px', color: '#EF4444', fontSize: 13, background: '#FEF2F2', borderRadius: 10, margin: 16 }}>
            Error: {dbError}
          </div>
        )}

        {!loading && !dbError && (
          <div style={{ overflowX: 'auto' }}>
            <table className="chk-tbl" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#F0F4FF' }}>
                  {['Inquilino', 'Habitación', 'Entrada', 'Salida prevista', 'Renta', 'Estado', 'Check-in', 'Acciones'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: '#1E4DB7', fontWeight: 700, fontSize: 11, borderBottom: '2px solid #E2E6EF', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {estancias.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '24px 12px', color: C.g5, textAlign: 'center', fontSize: 13 }}>
                      No hay estancias registradas.
                    </td>
                  </tr>
                ) : (
                  estancias.map((est: Estancia, i: number) => {
                    const inq = est.inquilino_id ? inqMap[est.inquilino_id] : null;
                    const uni = est.unidad_id ? unidadMap[est.unidad_id] : null;
                    const estStyle = ESTADO_STYLE[est.estado ?? ''] ?? { bg: '#F3F4F6', color: '#6B7280' };

                    return (
                      <tr key={est.id} style={{ background: i % 2 === 0 ? 'white' : '#F8FAFF', borderBottom: '1px solid #F0F0F0' }}>
                        <td style={{ padding: '10px 12px', fontWeight: 600, color: '#111827' }}>
                          {inq ? `${inq.nombre}${inq.apellidos ? ' ' + inq.apellidos : ''}` : <span style={{ color: C.g5 }}>—</span>}
                        </td>
                        <td style={{ padding: '10px 12px', color: C.g5 }}>
                          {uni
                            ? <span>{uni.propiedades?.nombre ? <span style={{ color: C.g5 }}>{uni.propiedades.nombre} · </span> : null}<strong style={{ color: '#111827' }}>{uni.nombre}</strong></span>
                            : est.unidad_id ?? <span style={{ color: C.g5 }}>—</span>
                          }
                        </td>
                        <td style={{ padding: '10px 12px', color: '#111827' }}>{fmt(est.fecha_entrada)}</td>
                        <td style={{ padding: '10px 12px', color: C.g5 }}>{fmt(est.fecha_salida_prevista)}</td>
                        <td style={{ padding: '10px 12px', fontWeight: 700, color: '#111827' }}>
                          {est.renta_mensual != null ? est.renta_mensual.toLocaleString() + '€' : '—'}
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{ background: estStyle.bg, color: estStyle.color, fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6 }}>
                            {est.estado ?? '—'}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          {est.checkin_completado
                            ? <span style={{ color: '#27AE60', fontWeight: 700, fontSize: 16 }}>✓</span>
                            : (
                              <button
                                onClick={() => handleCheckin(est.id)}
                                disabled={checkingIn === est.id}
                                style={{ background: '#D1FAE5', border: 'none', borderRadius: 7, padding: '3px 10px', fontSize: 11, fontWeight: 700, color: '#27AE60', cursor: 'pointer' }}
                              >
                                {checkingIn === est.id ? '…' : 'Confirmar entrada'}
                              </button>
                            )
                          }
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <div style={{ display: 'flex', gap: 6, flexShrink: 0, flexWrap: 'wrap' }}>
                            <button
                              onClick={() => { setEditEstancia(est); setModalOpen(true); }}
                              style={{ background: '#EFF6FF', border: 'none', borderRadius: 7, padding: '4px 10px', fontSize: 11, fontWeight: 700, color: '#1E4DB7', cursor: 'pointer' }}
                            >✏️ Editar</button>
                            {est.estado === 'ACTIVA' && (
                              <button
                                onClick={() => abrirBaja(est)}
                                style={{ background: '#FEF3C7', border: 'none', borderRadius: 7, padding: '4px 10px', fontSize: 11, fontWeight: 700, color: '#B45309', cursor: 'pointer' }}
                              >🚪 Dar de baja</button>
                            )}
                            <button
                              onClick={() => eliminarEstancia(est.id)}
                              style={{ width: 28, height: 28, background: '#FEE2E2', border: 'none', borderRadius: 7, fontSize: 14, color: '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >✕</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <EstanciaModal
          inquilinos={editEstancia ? inquilinos : inquilinosDisponibles}
          unidades={editEstancia ? unidades : unidadesLibres}
          editData={editEstancia}
          onClose={() => { setModalOpen(false); setEditEstancia(null); }}
          onSaved={() => { setModalOpen(false); setEditEstancia(null); load(); }}
        />
      )}

      {bajaEstancia && (
        <BajaModal
          estancia={bajaEstancia}
          onClose={() => setBajaEstancia(null)}
          onSaved={() => { setBajaEstancia(null); load(); }}
        />
      )}
    </div>
  );
}
