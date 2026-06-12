// SectionPisos
'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { C, card } from './tokens';

interface Habitacion {
  id: string;
  nombre: string;
  estado: string;
  precio_mensual: number;
  tipo?: string | null;
  precio_base?: number | null;
  precio_actual?: number | null;
  metros2?: number | null;
  tiene_banyo_privado?: boolean | null;
  tiene_balcon?: boolean | null;
}

interface UnidadForm {
  nombre: string;
  tipo: string;
  estado: string;
  precio_base: string;
  precio_actual: string;
  metros2: string;
  tiene_banyo_privado: boolean;
  tiene_balcon: boolean;
}

const EMPTY_UNIDAD: UnidadForm = {
  nombre: '',
  tipo: 'habitacion',
  estado: 'LIBRE',
  precio_base: '',
  precio_actual: '',
  metros2: '',
  tiene_banyo_privado: false,
  tiene_balcon: false,
};

function generateUnitId(propiedadId: string, nombre: string): string {
  const part = propiedadId.split('_')[1] ?? propiedadId.substring(0, 6);
  return 'UNIT_' + part + '_' + nombre.toUpperCase().replace(/\s/g, '_');
}

function UnidadModal({
  propiedadId,
  editData,
  onClose,
  onSaved,
}: {
  propiedadId: string;
  editData: (Habitacion & { _isEdit: boolean }) | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = editData?._isEdit ?? false;
  const [form, setForm] = useState<UnidadForm>(
    isEdit && editData
      ? {
          nombre: editData.nombre ?? '',
          tipo: editData.tipo ?? 'habitacion',
          estado: editData.estado ?? 'LIBRE',
          precio_base: editData.precio_base != null ? String(editData.precio_base) : '',
          precio_actual: editData.precio_actual != null ? String(editData.precio_actual) : '',
          metros2: editData.metros2 != null ? String(editData.metros2) : '',
          tiene_banyo_privado: editData.tiene_banyo_privado ?? false,
          tiene_balcon: editData.tiene_balcon ?? false,
        }
      : EMPTY_UNIDAD
  );
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  function setF(k: keyof UnidadForm, v: string | boolean) {
    setForm((f: UnidadForm) => ({ ...f, [k]: v }));
  }

  async function handleSave() {
    if (!form.nombre.trim()) { setErr('El nombre es obligatorio.'); return; }
    setSaving(true);
    setErr('');
    const sb = createClient();

    const payload = {
      nombre: form.nombre.trim(),
      tipo: form.tipo,
      estado: form.estado,
      precio_base: form.precio_base ? Number(form.precio_base) : null,
      precio_actual: form.precio_actual ? Number(form.precio_actual) : null,
      metros2: form.metros2 ? Number(form.metros2) : null,
      tiene_banyo_privado: form.tiene_banyo_privado,
      tiene_balcon: form.tiene_balcon,
    };

    if (isEdit && editData) {
      const { error } = await sb.from('unidades').update(payload).eq('id', editData.id);
      if (error) { setErr(error.message); setSaving(false); return; }
    } else {
      const id = generateUnitId(propiedadId, form.nombre);
      const { error } = await sb.from('unidades').insert({ id, propiedad_id: propiedadId, ...payload });
      if (error) { setErr(error.message); setSaving(false); return; }
    }

    setSaving(false);
    onSaved();
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1001, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: 'white', borderRadius: 16, width: '100%', maxWidth: 460, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 8px 40px rgba(30,77,183,0.18)' }}>
        <div style={{ padding: '20px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#1E4DB7' }}>
            {isEdit ? '✏️ Editar habitación' : '🛏️ Nueva habitación'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#9CA3AF', lineHeight: 1 }}>×</button>
        </div>
        <div style={{ padding: '16px 24px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={lbl}>Nombre *</label>
              <input style={inp} value={form.nombre} onChange={(e: { target: { value: string } }) => setF('nombre', e.target.value)} placeholder="HAB1" />
            </div>
            <div>
              <label style={lbl}>Tipo</label>
              <select style={inp} value={form.tipo} onChange={(e: { target: { value: string } }) => setF('tipo', e.target.value)}>
                <option value="habitacion">Habitación</option>
                <option value="estudio">Estudio</option>
                <option value="loft">Loft</option>
                <option value="cama">Cama</option>
              </select>
            </div>
            <div>
              <label style={lbl}>Estado</label>
              <select style={inp} value={form.estado} onChange={(e: { target: { value: string } }) => setF('estado', e.target.value)}>
                <option value="LIBRE">LIBRE</option>
                <option value="OCUPADA">OCUPADA</option>
                <option value="RESERVADA">RESERVADA</option>
                <option value="MANTENIMIENTO">MANTENIMIENTO</option>
              </select>
            </div>
            <div>
              <label style={lbl}>Metros²</label>
              <input style={inp} type="number" min="0" value={form.metros2} onChange={(e: { target: { value: string } }) => setF('metros2', e.target.value)} placeholder="12" />
            </div>
            <div>
              <label style={lbl}>Precio base (€)</label>
              <input style={inp} type="number" min="0" value={form.precio_base} onChange={(e: { target: { value: string } }) => setF('precio_base', e.target.value)} placeholder="850" />
            </div>
            <div>
              <label style={lbl}>Precio actual (€)</label>
              <input style={inp} type="number" min="0" value={form.precio_actual} onChange={(e: { target: { value: string } }) => setF('precio_actual', e.target.value)} placeholder="850" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 16 }}>
              <input type="checkbox" id="banyo" checked={form.tiene_banyo_privado} onChange={(e: { target: { checked: boolean } }) => setF('tiene_banyo_privado', e.target.checked)} style={{ width: 16, height: 16, cursor: 'pointer' }} />
              <label htmlFor="banyo" style={{ fontSize: 13, color: '#374151', cursor: 'pointer' }}>Baño privado</label>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 16 }}>
              <input type="checkbox" id="balcon" checked={form.tiene_balcon} onChange={(e: { target: { checked: boolean } }) => setF('tiene_balcon', e.target.checked)} style={{ width: 16, height: 16, cursor: 'pointer' }} />
              <label htmlFor="balcon" style={{ fontSize: 13, color: '#374151', cursor: 'pointer' }}>Balcón</label>
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
  barrio?: string | null;
  tipo?: string | null;
  num_unidades?: number | null;
  estado?: string | null;
  propietario_nombre?: string | null;
  alquiler_propietario?: number | null;
  wifi_nombre?: string | null;
  wifi_password?: string | null;
}

interface FormData {
  nombre: string;
  direccion: string;
  ciudad: string;
  barrio: string;
  tipo: string;
  num_unidades: string;
  estado: string;
  propietario_nombre: string;
  alquiler_propietario: string;
  wifi_nombre: string;
  wifi_password: string;
}

const EMPTY_FORM: FormData = {
  nombre: '',
  direccion: '',
  ciudad: 'Barcelona',
  barrio: '',
  tipo: 'piso',
  num_unidades: '',
  estado: 'CAPTACION',
  propietario_nombre: '',
  alquiler_propietario: '',
  wifi_nombre: '',
  wifi_password: '',
};

const COLORS = [C.b, C.p, C.g, C.y, C.r];

const inp = {
  width: '100%',
  padding: '9px 12px',
  border: `1.5px solid #E2E6EF`,
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

function generateId(barrio: string, ciudad: string): string {
  const b = barrio.toUpperCase().replace(/\s/g, '_').substring(0, 6) || 'XX';
  const c = ciudad.toUpperCase().substring(0, 4) || 'CITY';
  return 'PROP_' + b + '_' + c + '_' + Date.now().toString().slice(-6);
}

function PropiedadModal({
  editData,
  onClose,
  onSaved,
}: {
  editData: (PropiedadRaw & { _isEdit: boolean }) | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = editData?._isEdit ?? false;
  const [form, setForm] = useState<FormData>(
    isEdit && editData
      ? {
          nombre: editData.nombre ?? '',
          direccion: editData.direccion ?? '',
          ciudad: editData.ciudad ?? 'Barcelona',
          barrio: editData.barrio ?? '',
          tipo: editData.tipo ?? 'piso',
          num_unidades: editData.num_unidades != null ? String(editData.num_unidades) : '',
          estado: editData.estado ?? 'CAPTACION',
          propietario_nombre: editData.propietario_nombre ?? '',
          alquiler_propietario: editData.alquiler_propietario != null ? String(editData.alquiler_propietario) : '',
          wifi_nombre: editData.wifi_nombre ?? '',
          wifi_password: editData.wifi_password ?? '',
        }
      : EMPTY_FORM
  );
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  function set(k: keyof FormData, v: string) {
    setForm((f: FormData) => ({ ...f, [k]: v }));
  }

  async function handleSave() {
    if (!form.nombre.trim() || !form.direccion.trim() || !form.ciudad.trim()) {
      setErr('Nombre, dirección y ciudad son obligatorios.');
      return;
    }
    setSaving(true);
    setErr('');
    const sb = createClient();

    const payload = {
      nombre: form.nombre.trim(),
      direccion: form.direccion.trim(),
      ciudad: form.ciudad.trim(),
      barrio: form.barrio.trim() || null,
      tipo: form.tipo,
      num_unidades: form.num_unidades ? Number(form.num_unidades) : null,
      estado: form.estado,
      propietario_nombre: form.propietario_nombre.trim() || null,
      alquiler_propietario: form.alquiler_propietario ? Number(form.alquiler_propietario) : null,
      wifi_nombre: form.wifi_nombre.trim() || null,
      wifi_password: form.wifi_password.trim() || null,
    };

    if (isEdit && editData) {
      const { error } = await sb.from('propiedades').update(payload).eq('id', editData.id);
      console.log('UPDATE result:', { error, payload, id: editData.id });
      const check = await sb.from('propiedades').select('*').eq('id', editData.id).single();
      console.log('CHECK after update:', check);
      if (error) { setErr(error.message); setSaving(false); return; }
    } else {
      const id = generateId(form.barrio, form.ciudad);
      const { error } = await sb.from('propiedades').insert({ id, ...payload });
      if (error) { setErr(error.message); setSaving(false); return; }
    }

    setSaving(false);
    onSaved();
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: 'white', borderRadius: 16, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 8px 40px rgba(30,77,183,0.18)' }}>
        <div style={{ padding: '20px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#1E4DB7' }}>
            {isEdit ? '✏️ Editar propiedad' : '🏠 Nueva propiedad'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#9CA3AF', lineHeight: 1 }}>×</button>
        </div>

        <div style={{ padding: '16px 24px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={lbl}>Nombre *</label>
              <input style={inp} value={form.nombre} onChange={(e: { target: { value: string } }) => set('nombre', e.target.value)} placeholder="Piso Sants" />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={lbl}>Dirección *</label>
              <input style={inp} value={form.direccion} onChange={(e: { target: { value: string } }) => set('direccion', e.target.value)} placeholder="Carrer de..., 12" />
            </div>
            <div>
              <label style={lbl}>Ciudad *</label>
              <input style={inp} value={form.ciudad} onChange={(e: { target: { value: string } }) => set('ciudad', e.target.value)} />
            </div>
            <div>
              <label style={lbl}>Barrio</label>
              <input style={inp} value={form.barrio} onChange={(e: { target: { value: string } }) => set('barrio', e.target.value)} placeholder="Sants" />
            </div>
            <div>
              <label style={lbl}>Tipo</label>
              <select style={inp} value={form.tipo} onChange={(e: { target: { value: string } }) => set('tipo', e.target.value)}>
                <option value="piso">Piso</option>
                <option value="loft">Loft</option>
                <option value="coliving">Coliving</option>
                <option value="edificio">Edificio</option>
              </select>
            </div>
            <div>
              <label style={lbl}>Nº unidades</label>
              <input style={inp} type="number" min="0" value={form.num_unidades} onChange={(e: { target: { value: string } }) => set('num_unidades', e.target.value)} placeholder="4" />
            </div>
            <div>
              <label style={lbl}>Estado</label>
              <select style={inp} value={form.estado} onChange={(e: { target: { value: string } }) => set('estado', e.target.value)}>
                <option value="CAPTACION">CAPTACION</option>
                <option value="PREPARACION">PREPARACION</option>
                <option value="ACTIVO">ACTIVO</option>
              </select>
            </div>
            <div>
              <label style={lbl}>Alquiler propietario (€)</label>
              <input style={inp} type="number" min="0" value={form.alquiler_propietario} onChange={(e: { target: { value: string } }) => set('alquiler_propietario', e.target.value)} placeholder="1200" />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={lbl}>Propietario</label>
              <input style={inp} value={form.propietario_nombre} onChange={(e: { target: { value: string } }) => set('propietario_nombre', e.target.value)} placeholder="Nombre del propietario" />
            </div>
            <div>
              <label style={lbl}>WiFi nombre</label>
              <input style={inp} value={form.wifi_nombre} onChange={(e: { target: { value: string } }) => set('wifi_nombre', e.target.value)} placeholder="VirtuoWifi" />
            </div>
            <div>
              <label style={lbl}>WiFi contraseña</label>
              <input style={inp} value={form.wifi_password} onChange={(e: { target: { value: string } }) => set('wifi_password', e.target.value)} placeholder="••••••" />
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

export default function SectionPisos() {
  const [pisos, setPisos] = useState<Propiedad[]>([]);
  const [rawProps, setRawProps] = useState<PropiedadRaw[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<(PropiedadRaw & { _isEdit: boolean }) | null>(null);
  const [unidadModal, setUnidadModal] = useState<{ propiedadId: string; editData: (Habitacion & { _isEdit: boolean }) | null } | null>(null);

  async function load() {
    setLoading(true);
    const sb = createClient();

    const { data: props, error: propsError } = await sb
      .from('propiedades')
      .select('*')
      .order('nombre');

    if (propsError) {
      setDbError(`code: ${propsError.code} | message: ${propsError.message} | details: ${propsError.details} | hint: ${propsError.hint}`);
      setLoading(false);
      return;
    }

    if (!props || props.length === 0) {
      setDbError('Sin datos — code: (none) | La query no devolvió filas. RLS puede estar bloqueando o la tabla está vacía.');
      setLoading(false);
      return;
    }

    setRawProps(props as PropiedadRaw[]);

    const result: Propiedad[] = [];
    for (const [idx, p] of (props as PropiedadRaw[]).entries()) {
      const { data: habs, error: habsError } = await sb
        .from('unidades')
        .select('*')
        .eq('propiedad_id', p.id)
        .order('nombre');

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
    setDbError(null);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openNew() {
    setEditTarget(null);
    setModalOpen(true);
  }

  function openEdit(id: string) {
    const raw = rawProps.find((r: PropiedadRaw) => r.id === id);
    if (raw) setEditTarget({ ...raw, _isEdit: true });
    setModalOpen(true);
  }

  function handleSaved() {
    setModalOpen(false);
    setEditTarget(null);
    load();
  }

  function handleUnidadSaved() {
    setUnidadModal(null);
    load();
  }

  if (loading) return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
      {[1, 2, 3].map(i => <div key={i} style={{ background: C.g1, borderRadius: 14, height: 280 }} />)}
    </div>
  );

  if (dbError) return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <button onClick={openNew} style={{ padding: '8px 16px', background: '#1E4DB7', color: 'white', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          + Nueva Propiedad
        </button>
      </div>
      <div style={{ ...card, padding: '20px 24px', borderLeft: `4px solid ${C.r}` }}>
        <div style={{ fontWeight: 700, color: C.r, marginBottom: 6 }}>Error al cargar propiedades</div>
        <div style={{ fontSize: 12, color: C.g5, fontFamily: 'monospace' }}>{dbError}</div>
      </div>
      {modalOpen && <PropiedadModal editData={editTarget} onClose={() => setModalOpen(false)} onSaved={handleSaved} />}
    </div>
  );

  return (
    <div>
      <style>{`@media(max-width:700px){.pisos-grid{grid-template-columns:1fr!important}}`}</style>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
        <button onClick={openNew} style={{ padding: '8px 18px', background: '#1E4DB7', color: 'white', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', letterSpacing: 0.2 }}>
          + Nueva Propiedad
        </button>
      </div>

      {pisos.length === 0 ? (
        <div style={{ ...card, padding: '20px 24px', borderLeft: `4px solid ${C.y}` }}>
          <div style={{ fontWeight: 700, color: C.y, marginBottom: 6 }}>Sin datos</div>
          <div style={{ fontSize: 12, color: C.g5 }}>No se encontraron propiedades en la base de datos.</div>
        </div>
      ) : (
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                      onClick={() => openEdit(p.id)}
                      style={{ background: '#F0F4FF', border: 'none', borderRadius: 8, padding: '4px 10px', fontSize: 12, fontWeight: 600, color: '#1E4DB7', cursor: 'pointer' }}
                    >
                      ✏️ Editar
                    </button>
                    <span style={{
                      background: pct >= 75 ? C.gl : pct > 0 ? C.yl : C.rl,
                      color: pct >= 75 ? C.g : pct > 0 ? C.y : C.r,
                      fontWeight: 700, fontSize: 11, padding: '3px 9px', borderRadius: 8,
                    }}>{pct}%</span>
                  </div>
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
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                    {habs.map((h: Habitacion) => (
                      <span
                        key={h.id}
                        onClick={() => setUnidadModal({ propiedadId: p.id, editData: { ...h, _isEdit: true } })}
                        style={{
                          background: h.estado === 'ocupada' ? C.bl : C.g1,
                          color: h.estado === 'ocupada' ? C.b : C.g5,
                          border: `1px solid ${h.estado === 'ocupada' ? C.b : C.bd}`,
                          borderRadius: 6, padding: '3px 8px', fontSize: 11, fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >{h.nombre}</span>
                    ))}
                    <button
                      onClick={() => setUnidadModal({ propiedadId: p.id, editData: null })}
                      style={{ background: '#F0F4FF', border: '1px dashed #1E4DB7', borderRadius: 6, padding: '3px 8px', fontSize: 11, fontWeight: 700, color: '#1E4DB7', cursor: 'pointer' }}
                    >+ Hab</button>
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
      )}

      {modalOpen && <PropiedadModal editData={editTarget} onClose={() => setModalOpen(false)} onSaved={handleSaved} />}
      {unidadModal && (
        <UnidadModal
          propiedadId={unidadModal.propiedadId}
          editData={unidadModal.editData}
          onClose={() => setUnidadModal(null)}
          onSaved={handleUnidadSaved}
        />
      )}
    </div>
  );
}
