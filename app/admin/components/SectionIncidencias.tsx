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
  coste: number | null;
  unidad_id: string | null;
  propiedad_id: string | null;
  unidad_nombre: string | null;
  propiedad_nombre: string | null;
}

interface PropiedadSimple { id: string; nombre: string; }
interface UnidadSimple   { id: string; nombre: string; propiedad_id: string | null; propiedades?: { nombre: string } | null; }

interface IncForm {
  propiedad_id: string;
  unidad_id: string;
  tipo: string;
  descripcion: string;
  prioridad: string;
  estado: string;
  coste: string;
  sla_horas: string;
}

const EMPTY_FORM: IncForm = {
  propiedad_id: '',
  unidad_id: '',
  tipo: 'otros',
  descripcion: '',
  prioridad: 'media',
  estado: 'ABIERTA',
  coste: '',
  sla_horas: '48',
};

const TIPOS = ['fontaneria', 'electricidad', 'limpieza', 'cerrajeria', 'electrodomestico', 'pintura', 'otros'];
const ESTADOS_INC = ['ABIERTA', 'EN_PROCESO', 'RESUELTA', 'CERRADA'];

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

const lbl = { display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 4 };

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

function IncidenciaModal({
  editData,
  propiedades,
  unidades,
  onClose,
  onSaved,
}: {
  editData: (IncidenciaRow & { _isEdit: boolean }) | null;
  propiedades: PropiedadSimple[];
  unidades: UnidadSimple[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = editData?._isEdit ?? false;
  const [form, setForm] = useState<IncForm>(
    isEdit && editData
      ? {
          propiedad_id: editData.propiedad_id ?? '',
          unidad_id: editData.unidad_id ?? '',
          tipo: editData.tipo ?? 'otros',
          descripcion: editData.descripcion ?? '',
          prioridad: editData.prioridad ?? 'media',
          estado: editData.estado ?? 'ABIERTA',
          coste: editData.coste != null ? String(editData.coste) : '',
          sla_horas: editData.sla_horas != null ? String(editData.sla_horas) : '48',
        }
      : EMPTY_FORM
  );
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  function set(k: keyof IncForm, v: string) {
    setForm((f: IncForm) => {
      const next = { ...f, [k]: v };
      if (k === 'propiedad_id') next.unidad_id = '';
      return next;
    });
  }

  const unidadesFiltradas = form.propiedad_id
    ? unidades.filter((u: UnidadSimple) => u.propiedad_id === form.propiedad_id)
    : unidades;

  async function handleSave() {
    if (!form.propiedad_id) { setErr('La propiedad es obligatoria.'); return; }
    if (!form.descripcion.trim()) { setErr('La descripción es obligatoria.'); return; }
    setSaving(true);
    setErr('');
    const sb = createClient();

    const payload = {
      propiedad_id: form.propiedad_id || null,
      unidad_id: form.unidad_id || null,
      tipo: form.tipo,
      descripcion: form.descripcion.trim(),
      prioridad: form.prioridad,
      estado: form.estado,
      coste: form.coste ? Number(form.coste) : null,
      sla_horas: form.sla_horas ? Number(form.sla_horas) : 48,
    };

    if (isEdit && editData) {
      const { error } = await sb.from('incidencias').update(payload).eq('id', editData.id);
      if (error) { setErr(error.message); setSaving(false); return; }
    } else {
      const id = 'INC_' + Date.now().toString().slice(-8);
      const { error } = await sb.from('incidencias').insert({ id, ...payload, fecha_reporte: new Date().toISOString() });
      if (error) { setErr(error.message); setSaving(false); return; }
    }

    setSaving(false);
    onSaved();
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: 'white', borderRadius: 16, width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 8px 40px rgba(30,77,183,0.18)' }}>
        <div style={{ padding: '20px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#1E4DB7' }}>
            {isEdit ? '✏️ Editar incidencia' : '🔧 Nueva incidencia'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#9CA3AF', lineHeight: 1 }}>×</button>
        </div>
        <div style={{ padding: '16px 24px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={lbl}>Propiedad *</label>
              <select style={inp} value={form.propiedad_id} onChange={(e: { target: { value: string } }) => set('propiedad_id', e.target.value)}>
                <option value="">— Selecciona —</option>
                {propiedades.map((p: PropiedadSimple) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>
            {form.propiedad_id && (
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={lbl}>Habitación</label>
              <select style={inp} value={form.unidad_id} onChange={(e: { target: { value: string } }) => set('unidad_id', e.target.value)}>
                <option value="">— Todas / zona común —</option>
                {unidadesFiltradas.map((u: UnidadSimple) => <option key={u.id} value={u.id}>{u.propiedades?.nombre ? u.propiedades.nombre + ' · ' + u.nombre : u.nombre}</option>)}
              </select>
            </div>
            )}
            <div>
              <label style={lbl}>Tipo</label>
              <select style={inp} value={form.tipo} onChange={(e: { target: { value: string } }) => set('tipo', e.target.value)}>
                {TIPOS.map(t => <option key={t} value={t} style={{ textTransform: 'capitalize' }}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Prioridad</label>
              <select style={inp} value={form.prioridad} onChange={(e: { target: { value: string } }) => set('prioridad', e.target.value)}>
                <option value="alta">Alta</option>
                <option value="media">Media</option>
                <option value="baja">Baja</option>
              </select>
            </div>
            <div>
              <label style={lbl}>Estado</label>
              <select style={inp} value={form.estado} onChange={(e: { target: { value: string } }) => set('estado', e.target.value)}>
                {ESTADOS_INC.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>SLA (horas)</label>
              <select style={inp} value={form.sla_horas} onChange={(e: { target: { value: string } }) => set('sla_horas', e.target.value)}>
                <option value="24">24h · Urgente</option>
                <option value="48">48h · Estándar</option>
                <option value="72">72h · Normal</option>
                <option value="168">1 semana</option>
              </select>
            </div>
            <div>
              <label style={lbl}>Coste estimado (€)</label>
              <input style={inp} type="number" min="0" value={form.coste} onChange={(e: { target: { value: string } }) => set('coste', e.target.value)} placeholder="—" />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={lbl}>Descripción *</label>
              <textarea
                style={{ ...inp, minHeight: 80, resize: 'vertical' }}
                value={form.descripcion}
                onChange={(e: { target: { value: string } }) => set('descripcion', e.target.value)}
                placeholder="Describe el problema..."
              />
            </div>
          </div>

          {err && <p style={{ margin: 0, color: '#EF4444', fontSize: 12, background: '#FEF2F2', padding: '8px 12px', borderRadius: 8 }}>{err}</p>}

          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button onClick={onClose} style={{ flex: 1, padding: '11px', background: 'white', border: '1.5px solid #E2E6EF', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#6B7280' }}>
              Cancelar
            </button>
            <button onClick={handleSave} disabled={saving} style={{ flex: 2, padding: '11px', background: '#1E4DB7', color: 'white', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SectionIncidencias() {
  const [data, setData] = useState<IncidenciaRow[]>([]);
  const [propiedades, setPropiedades] = useState<PropiedadSimple[]>([]);
  const [unidades, setUnidades] = useState<UnidadSimple[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<(IncidenciaRow & { _isEdit: boolean }) | null>(null);

  async function load() {
    setLoading(true);
    const sb = createClient();

    const [incRes, propRes, uniRes] = await Promise.all([
      sb.from('incidencias')
        .select('id, tipo, descripcion, prioridad, estado, fecha_reporte, sla_horas, coste, unidad_id, propiedad_id, unidades(nombre), propiedades(nombre)')
        .order('fecha_reporte', { ascending: false }),
      sb.from('propiedades').select('id, nombre').order('nombre'),
      sb.from('unidades').select('id, nombre, propiedad_id, propiedades(nombre)').order('nombre'),
    ]);

    if (!incRes.error && incRes.data) {
      setData(
        (incRes.data as unknown as Array<{
          id: string; tipo: string; descripcion: string | null; prioridad: string;
          estado: string; fecha_reporte: string; sla_horas: number | null; coste: number | null;
          unidad_id: string | null; propiedad_id: string | null;
          unidades: { nombre: string } | null; propiedades: { nombre: string } | null;
        }>).map(r => ({
          id: r.id, tipo: r.tipo, descripcion: r.descripcion, prioridad: r.prioridad,
          estado: r.estado, fecha_reporte: r.fecha_reporte, sla_horas: r.sla_horas,
          coste: r.coste, unidad_id: r.unidad_id, propiedad_id: r.propiedad_id,
          unidad_nombre: r.unidades?.nombre ?? null,
          propiedad_nombre: r.propiedades?.nombre ?? null,
        }))
      );
    }
    if (!propRes.error) setPropiedades((propRes.data ?? []) as PropiedadSimple[]);
    if (!uniRes.error) setUnidades((uniRes.data ?? []) as UnidadSimple[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openEdit(inc: IncidenciaRow) {
    setEditTarget({ ...inc, _isEdit: true });
    setModalOpen(true);
  }

  function handleSaved() {
    setModalOpen(false);
    setEditTarget(null);
    load();
  }

  const altas     = data.filter((i: IncidenciaRow) => i.prioridad === 'alta').length;
  const medias    = data.filter((i: IncidenciaRow) => i.prioridad === 'media').length;
  const resueltas = data.filter((i: IncidenciaRow) => i.estado === 'RESUELTA' || i.estado === 'resuelta').length;
  const slaVencidas = data.filter((i: IncidenciaRow) => i.estado !== 'RESUELTA' && i.estado !== 'resuelta' && isSlaVencido(i.fecha_reporte, i.sla_horas)).length;

  if (loading) return (
    <div>{[1, 2, 3, 4].map(i => <div key={i} style={{ background: C.g1, borderRadius: 10, height: 60, marginBottom: 12 }} />)}</div>
  );

  return (
    <div>
      <style>{`@media(max-width:700px){.inc-kpi{grid-template-columns:1fr 1fr!important}}`}</style>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
        <button
          onClick={() => { setEditTarget(null); setModalOpen(true); }}
          style={{ padding: '8px 18px', background: '#1E4DB7', color: 'white', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
        >
          + Nueva Incidencia
        </button>
      </div>

      <div className="inc-kpi" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
        {[
          { label: 'Prioridad Alta', val: altas,      color: C.r, icon: '🔴' },
          { label: 'Prioridad Media', val: medias,    color: C.y, icon: '🟡' },
          { label: 'Resueltas',       val: resueltas, color: C.g, icon: '✅' },
          { label: 'SLA Vencido',     val: slaVencidas, color: C.r, icon: '⏰' },
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
        {data.length === 0 && (
          <div style={{ ...card, padding: '20px 24px', color: C.g5, fontSize: 13, textAlign: 'center' }}>
            No hay incidencias registradas.
          </div>
        )}
        {data.map((inc: IncidenciaRow) => {
          const pStyle = priorityPill(inc.prioridad);
          const borderColor = priorityColor(inc.prioridad);
          const isResuelta = inc.estado === 'RESUELTA' || inc.estado === 'resuelta';
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
                    {!isResuelta && (inc.estado === 'EN_PROCESO' || inc.estado === 'en_proceso') && (
                      <span style={{ background: C.bl, color: C.b, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 8 }}>EN PROCESO</span>
                    )}
                    {vencido && (
                      <span style={{ background: C.rl, color: C.r, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 8 }}>⏰ SLA VENCIDO</span>
                    )}
                  </div>
                  <button
                    onClick={() => openEdit(inc)}
                    style={{ background: '#F0F4FF', border: 'none', borderRadius: 8, padding: '4px 10px', fontSize: 11, fontWeight: 600, color: '#1E4DB7', cursor: 'pointer', flexShrink: 0 }}
                  >
                    ✏️ Editar
                  </button>
                </div>
                <div style={{ fontWeight: 700, fontSize: 14, color: C.g9, marginBottom: 4, textTransform: 'capitalize' }}>{inc.tipo}</div>
                {inc.descripcion && (
                  <div style={{ fontSize: 12.5, color: C.g5, marginBottom: 8 }}>{inc.descripcion}</div>
                )}
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 11, color: C.g5 }}>
                  {inc.propiedad_nombre && <span>🏠 {inc.propiedad_nombre}</span>}
                  {inc.unidad_nombre && <span>🚪 {inc.unidad_nombre}</span>}
                  <span>📅 {fecha}</span>
                  {inc.coste != null && <span>💶 {inc.coste}€</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {modalOpen && (
        <IncidenciaModal
          editData={editTarget}
          propiedades={propiedades}
          unidades={unidades}
          onClose={() => { setModalOpen(false); setEditTarget(null); }}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
