'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { C, card } from './tokens';

interface Proveedor {
  id: string;
  nombre: string;
  empresa: string | null;
  telefono: string | null;
  email: string | null;
  especialidad: string[] | null;
  estado: string | null;
  score: number | null;
  trabajos_realizados: number | null;
  coste_medio: number | null;
  notas: string | null;
}

interface ProvForm {
  nombre: string;
  empresa: string;
  telefono: string;
  email: string;
  especialidad: string[];
  estado: string;
  score: string;
  coste_medio: string;
  notas: string;
}

const EMPTY_FORM: ProvForm = {
  nombre: '',
  empresa: '',
  telefono: '',
  email: '',
  especialidad: [],
  estado: 'ACTIVO',
  score: '10',
  coste_medio: '',
  notas: '',
};

const ESPECIALIDADES = ['limpieza', 'fontaneria', 'electricidad', 'cerrajeria', 'pintura', 'climatizacion', 'reformas', 'mudanzas', 'otros'];

const ESTADO_STYLE: Record<string, { bg: string; color: string }> = {
  ACTIVO:     { bg: '#D1FAE5', color: '#27AE60' },
  EN_PROCESO: { bg: '#FEF3C7', color: '#F59E0B' },
  INACTIVO:   { bg: '#F3F4F6', color: '#6B7280' },
  BLACKLIST:  { bg: '#FEE2E2', color: '#EF4444' },
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

const lbl = { display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 4 };

function scoreColor(s: number | null): string {
  if (s == null) return C.g5;
  if (s >= 8) return '#27AE60';
  if (s >= 6) return '#F59E0B';
  return '#EF4444';
}

function ProveedorModal({
  editData,
  onClose,
  onSaved,
}: {
  editData: (Proveedor & { _isEdit: boolean }) | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = editData?._isEdit ?? false;
  const [form, setForm] = useState<ProvForm>(
    isEdit && editData
      ? {
          nombre: editData.nombre ?? '',
          empresa: editData.empresa ?? '',
          telefono: editData.telefono ?? '',
          email: editData.email ?? '',
          especialidad: editData.especialidad ?? [],
          estado: editData.estado ?? 'ACTIVO',
          score: editData.score != null ? String(editData.score) : '10',
          coste_medio: editData.coste_medio != null ? String(editData.coste_medio) : '',
          notas: editData.notas ?? '',
        }
      : EMPTY_FORM
  );
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  function set(k: keyof ProvForm, v: string) {
    setForm((f: ProvForm) => ({ ...f, [k]: v }));
  }

  function toggleEspecialidad(esp: string) {
    setForm((f: ProvForm) => ({
      ...f,
      especialidad: f.especialidad.includes(esp)
        ? f.especialidad.filter((e: string) => e !== esp)
        : [...f.especialidad, esp],
    }));
  }

  async function handleSave() {
    if (!form.nombre.trim()) { setErr('El nombre es obligatorio.'); return; }
    setSaving(true);
    setErr('');
    const sb = createClient();

    const payload = {
      nombre: form.nombre.trim(),
      empresa: form.empresa.trim() || null,
      telefono: form.telefono.trim() || null,
      email: form.email.trim() || null,
      especialidad: form.especialidad.length > 0 ? form.especialidad : null,
      estado: form.estado,
      score: form.score ? Number(form.score) : null,
      coste_medio: form.coste_medio ? Number(form.coste_medio) : null,
      notas: form.notas.trim() || null,
    };

    if (isEdit && editData) {
      const { error } = await sb.from('proveedores').update(payload).eq('id', editData.id);
      if (error) { setErr(error.message); setSaving(false); return; }
    } else {
      const id = 'PROV_' + Date.now().toString().slice(-8);
      const { error } = await sb.from('proveedores').insert({ id, ...payload });
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
            {isEdit ? '✏️ Editar proveedor' : '🔧 Nuevo proveedor'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#9CA3AF', lineHeight: 1 }}>×</button>
        </div>
        <div style={{ padding: '16px 24px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={lbl}>Nombre *</label>
              <input style={inp} value={form.nombre} onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('nombre', e.target.value)} placeholder="Juan García" />
            </div>
            <div>
              <label style={lbl}>Empresa</label>
              <input style={inp} value={form.empresa} onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('empresa', e.target.value)} placeholder="Reformas SL" />
            </div>
            <div>
              <label style={lbl}>Teléfono</label>
              <input style={inp} value={form.telefono} onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('telefono', e.target.value)} placeholder="+34 600 000 000" />
            </div>
            <div>
              <label style={lbl}>Email</label>
              <input style={inp} type="email" value={form.email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('email', e.target.value)} placeholder="juan@empresa.com" />
            </div>
            <div>
              <label style={lbl}>Estado</label>
              <select style={inp} value={form.estado} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => set('estado', e.target.value)}>
                <option value="ACTIVO">ACTIVO</option>
                <option value="EN_PROCESO">EN_PROCESO</option>
                <option value="INACTIVO">INACTIVO</option>
                <option value="BLACKLIST">BLACKLIST</option>
              </select>
            </div>
            <div>
              <label style={lbl}>Score</label>
              <select style={inp} value={form.score} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => set('score', e.target.value)}>
                {[10,9,8,7,6,5,4,3,2,1].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Coste medio (€)</label>
              <input style={inp} type="number" min="0" value={form.coste_medio} onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('coste_medio', e.target.value)} placeholder="150" />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={lbl}>Especialidades</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                {ESPECIALIDADES.map((esp: string) => {
                  const active = form.especialidad.includes(esp);
                  return (
                    <button
                      key={esp}
                      type="button"
                      onClick={() => toggleEspecialidad(esp)}
                      style={{
                        padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        background: active ? '#1E4DB7' : '#F0F4FF',
                        color: active ? 'white' : '#1E4DB7',
                        border: `1.5px solid ${active ? '#1E4DB7' : '#C7D2FE'}`,
                      }}
                    >
                      {esp}
                    </button>
                  );
                })}
              </div>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={lbl}>Notas</label>
              <textarea
                style={{ ...inp, minHeight: 72, resize: 'vertical' }}
                value={form.notas}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => set('notas', e.target.value)}
                placeholder="Observaciones internas..."
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

export default function SectionProveedores() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<(Proveedor & { _isEdit: boolean }) | null>(null);

  async function load() {
    setLoading(true);
    const sb = createClient();
    const { data, error } = await sb
      .from('proveedores')
      .select('id, nombre, empresa, telefono, email, especialidad, estado, score, trabajos_realizados, coste_medio, notas')
      .order('nombre');

    if (error) { setDbError(error.message); setLoading(false); return; }
    setProveedores((data ?? []) as Proveedor[]);
    setDbError(null);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function eliminarProveedor(id: string) {
    if (!confirm('¿Seguro que quieres eliminar este proveedor?')) return;
    const sb = createClient();
    await sb.from('proveedores').delete().eq('id', id);
    await load();
  }

  function openEdit(p: Proveedor) {
    setEditTarget({ ...p, _isEdit: true });
    setModalOpen(true);
  }

  function handleSaved() {
    setModalOpen(false);
    setEditTarget(null);
    load();
  }

  if (loading) return (
    <div>{[1,2,3].map(i => <div key={i} style={{ background: C.g1, borderRadius: 14, height: 160, marginBottom: 14 }} />)}</div>
  );

  return (
    <div>
      <style>{`@media(max-width:700px){.prov-metrics{grid-template-columns:1fr 1fr!important}}`}</style>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
        <button
          onClick={() => { setEditTarget(null); setModalOpen(true); }}
          style={{ padding: '8px 18px', background: '#1E4DB7', color: 'white', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
        >
          + Nuevo Proveedor
        </button>
      </div>

      {dbError && (
        <div style={{ ...card, padding: '16px 20px', borderLeft: '4px solid #EF4444', marginBottom: 14 }}>
          <div style={{ fontWeight: 700, color: '#EF4444', marginBottom: 4 }}>Error al cargar proveedores</div>
          <div style={{ fontSize: 12, color: C.g5, fontFamily: 'monospace' }}>{dbError}</div>
        </div>
      )}

      {!dbError && proveedores.length === 0 && (
        <div style={{ ...card, padding: '32px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>🔧</div>
          <div style={{ fontWeight: 700, color: C.g9, marginBottom: 6 }}>No hay proveedores registrados</div>
          <div style={{ fontSize: 13, color: C.g5, marginBottom: 16 }}>Añade tu primer proveedor para empezar.</div>
          <button
            onClick={() => { setEditTarget(null); setModalOpen(true); }}
            style={{ padding: '10px 24px', background: '#1E4DB7', color: 'white', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
          >
            + Nuevo Proveedor
          </button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {proveedores.map((p: Proveedor) => {
          const estStyle = ESTADO_STYLE[p.estado ?? ''] ?? { bg: '#F3F4F6', color: '#6B7280' };
          const sc = scoreColor(p.score);

          return (
            <div key={p.id} style={{ ...card, marginBottom: 0 }}>
              <div style={{ height: 3, background: sc }} />
              <div style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 16, color: C.g9 }}>{p.nombre}</div>
                    {p.empresa && <div style={{ fontSize: 12, color: C.g5, marginTop: 2 }}>{p.empresa}</div>}
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {p.score != null && (
                      <div style={{ textAlign: 'center', minWidth: 40 }}>
                        <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 22, color: sc, lineHeight: 1 }}>{p.score}</div>
                        <div style={{ fontSize: 9, color: C.g5 }}>score</div>
                      </div>
                    )}
                    <span style={{ background: estStyle.bg, color: estStyle.color, fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 8 }}>
                      {p.estado ?? '—'}
                    </span>
                    <button
                      onClick={() => openEdit(p)}
                      style={{ background: '#F0F4FF', border: 'none', borderRadius: 8, padding: '4px 10px', fontSize: 12, fontWeight: 600, color: '#1E4DB7', cursor: 'pointer' }}
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => eliminarProveedor(p.id)}
                      title="Eliminar"
                      style={{ background: '#F3F4F6', color: '#6B7280', border: 'none', borderRadius: 6, width: 28, height: 28, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => { const el = e.currentTarget as HTMLButtonElement; el.style.background = '#FEE2E2'; el.style.color = '#EF4444'; }}
                      onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => { const el = e.currentTarget as HTMLButtonElement; el.style.background = '#F3F4F6'; el.style.color = '#6B7280'; }}
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {p.especialidad && p.especialidad.length > 0 && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                    {p.especialidad.map((esp: string) => (
                      <span key={esp} style={{ background: '#F0F4FF', color: '#1E4DB7', fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20 }}>
                        {esp}
                      </span>
                    ))}
                  </div>
                )}

                <div className="prov-metrics" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 10 }}>
                  {[
                    { k: 'Teléfono', v: p.telefono ?? '—' },
                    { k: 'Email', v: p.email ?? '—' },
                    { k: 'Trabajos', v: p.trabajos_realizados != null ? String(p.trabajos_realizados) : '—' },
                    { k: 'Coste medio', v: p.coste_medio != null ? p.coste_medio + '€' : '—' },
                  ].map((m, i) => (
                    <div key={i} style={{ background: C.g0, borderRadius: 8, padding: '8px 10px', textAlign: 'center', border: `1px solid ${C.bd}` }}>
                      <div style={{ fontWeight: 700, fontSize: 12, color: C.g9, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.v}</div>
                      <div style={{ fontSize: 10, color: C.g5, marginTop: 2 }}>{m.k}</div>
                    </div>
                  ))}
                </div>

                {p.notas && (
                  <div style={{ fontSize: 12, color: C.g5, borderTop: `1px solid ${C.g1}`, paddingTop: 8 }}>
                    📝 {p.notas}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {modalOpen && (
        <ProveedorModal
          editData={editTarget}
          onClose={() => { setModalOpen(false); setEditTarget(null); }}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
