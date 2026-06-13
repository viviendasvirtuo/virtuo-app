'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { C, card } from './tokens';

interface Candidato {
  id: string;
  nombre_completo: string;
  email: string | null;
  telefono: string | null;
  dni_nie: string | null;
  motivo_estancia: string | null;
  grupo_flujo: string | null;
  ponderacion_total: number | null;
  veredicto: string | null;
  pack_escogido: string | null;
  precio_habitacion: number | null;
  fecha_entrada: string | null;
  fecha_salida: string | null;
  estado: string;
  unidad_interes_id: string | null;
}

interface Inquilino {
  id: string;
  nombre: string;
  apellidos: string | null;
  email: string | null;
  telefono: string | null;
  grupo: string | null;
  score_inquilino: number | null;
  blacklist: boolean | null;
}

interface InquilinoFull extends Inquilino {
  dni_nie?: string | null;
  ocupacion?: string | null;
  ingresos_mensuales?: number | null;
  notas?: string | null;
}

interface FormData {
  nombre: string;
  apellidos: string;
  email: string;
  telefono: string;
  dni_nie: string;
  grupo: string;
  ocupacion: string;
  ingresos_mensuales: string;
  score_inquilino: string;
  notas: string;
}

const EMPTY_FORM: FormData = {
  nombre: '',
  apellidos: '',
  email: '',
  telefono: '',
  dni_nie: '',
  grupo: 'G1 · Estudiante internacional / Erasmus / máster',
  ocupacion: '',
  ingresos_mensuales: '',
  score_inquilino: '10',
  notas: '',
};

const GRUPOS = [
  'G1 · Estudiante internacional / Erasmus / máster',
  'G2 · Nómada digital / freelance / creativo tech',
  'G3 · Cocinero / hostelería / camarero',
  'G4 · Operario / técnico / instalador / fábrica',
  'G5 · Profesional joven (ingeniero, consultor, residente sanitario)',
  'G6 · Sanitario desplazado (enfermero, médico temporal)',
  'G7 · Artista / creativo / músico / fotógrafo / diseñador',
  'G8 · Directivo / manager / consultor senior',
  'G9 · Recién llegado / buscando trabajo',
  'G10 · Jubilado / pensionista con ingresos estables',
];

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

function InquilinoModal({
  editData,
  onClose,
  onSaved,
}: {
  editData: (InquilinoFull & { _isEdit: boolean }) | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = editData?._isEdit ?? false;
  const [form, setForm] = useState<FormData>(
    isEdit && editData
      ? {
          nombre: editData.nombre ?? '',
          apellidos: editData.apellidos ?? '',
          email: editData.email ?? '',
          telefono: editData.telefono ?? '',
          dni_nie: editData.dni_nie ?? '',
          grupo: editData.grupo ?? 'G1 Estudiante',
          ocupacion: editData.ocupacion ?? '',
          ingresos_mensuales: editData.ingresos_mensuales != null ? String(editData.ingresos_mensuales) : '',
          score_inquilino: editData.score_inquilino != null ? String(editData.score_inquilino) : '10',
          notas: editData.notas ?? '',
        }
      : EMPTY_FORM
  );
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  function set(k: keyof FormData, v: string) {
    setForm((f: FormData) => ({ ...f, [k]: v }));
  }

  async function handleSave() {
    if (!form.nombre.trim()) { setErr('El nombre es obligatorio.'); return; }
    setSaving(true);
    setErr('');
    const sb = createClient();

    const payload = {
      nombre: form.nombre.trim(),
      apellidos: form.apellidos.trim() || null,
      email: form.email.trim() || null,
      telefono: form.telefono.trim() || null,
      dni_nie: form.dni_nie.trim() || null,
      grupo: form.grupo || null,
      ocupacion: form.ocupacion.trim() || null,
      ingresos_mensuales: form.ingresos_mensuales ? Number(form.ingresos_mensuales) : null,
      score_inquilino: form.score_inquilino ? Number(form.score_inquilino) : 10,
      notas: form.notas.trim() || null,
    };

    if (isEdit && editData) {
      const { error } = await sb.from('inquilinos').update(payload).eq('id', editData.id);
      if (error) { setErr(error.message); setSaving(false); return; }
    } else {
      const id = 'INQ_' + Date.now().toString().slice(-8);
      const { error } = await sb.from('inquilinos').insert({ id, ...payload });
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
            {isEdit ? '✏️ Editar inquilino' : '👤 Nuevo inquilino'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#9CA3AF', lineHeight: 1 }}>×</button>
        </div>
        <div style={{ padding: '16px 24px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={lbl}>Nombre *</label>
              <input style={inp} value={form.nombre} onChange={(e: { target: { value: string } }) => set('nombre', e.target.value)} placeholder="María" />
            </div>
            <div>
              <label style={lbl}>Apellidos</label>
              <input style={inp} value={form.apellidos} onChange={(e: { target: { value: string } }) => set('apellidos', e.target.value)} placeholder="García López" />
            </div>
            <div>
              <label style={lbl}>Email</label>
              <input style={inp} type="email" value={form.email} onChange={(e: { target: { value: string } }) => set('email', e.target.value)} placeholder="maria@email.com" />
            </div>
            <div>
              <label style={lbl}>Teléfono</label>
              <input style={inp} value={form.telefono} onChange={(e: { target: { value: string } }) => set('telefono', e.target.value)} placeholder="+34 600 000 000" />
            </div>
            <div>
              <label style={lbl}>DNI / NIE</label>
              <input style={inp} value={form.dni_nie} onChange={(e: { target: { value: string } }) => set('dni_nie', e.target.value)} placeholder="12345678A" />
            </div>
            <div>
              <label style={lbl}>Ocupación</label>
              <input style={inp} value={form.ocupacion} onChange={(e: { target: { value: string } }) => set('ocupacion', e.target.value)} placeholder="Estudiante de máster" />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={lbl}>Grupo</label>
              <select style={inp} value={form.grupo} onChange={(e: { target: { value: string } }) => set('grupo', e.target.value)}>
                {GRUPOS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Ingresos mensuales (€)</label>
              <input style={inp} type="number" min="0" value={form.ingresos_mensuales} onChange={(e: { target: { value: string } }) => set('ingresos_mensuales', e.target.value)} placeholder="1500" />
            </div>
            <div>
              <label style={lbl}>Score inquilino (0-10)</label>
              <input style={inp} type="number" min="0" max="10" value={form.score_inquilino} onChange={(e: { target: { value: string } }) => set('score_inquilino', e.target.value)} placeholder="10" />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={lbl}>Notas</label>
              <textarea
                style={{ ...inp, minHeight: 72, resize: 'vertical' }}
                value={form.notas}
                onChange={(e: { target: { value: string } }) => set('notas', e.target.value)}
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

export default function SectionPipeline() {
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [loadingCand, setLoadingCand] = useState(true);
  const [inquilinos, setInquilinos] = useState<Inquilino[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<(InquilinoFull & { _isEdit: boolean }) | null>(null);

  async function loadCandidatos() {
    setLoadingCand(true);
    const sb = createClient();
    const { data } = await sb
      .from('candidatos')
      .select('id, nombre_completo, email, telefono, dni_nie, motivo_estancia, grupo_flujo, ponderacion_total, veredicto, pack_escogido, precio_habitacion, fecha_entrada, fecha_salida, estado, unidad_interes_id')
      .in('estado', ['NUEVO', 'REVISADO'])
      .order('fecha_alta', { ascending: false });
    setCandidatos((data ?? []) as Candidato[]);
    setLoadingCand(false);
  }

  async function convertirCandidato(c: Candidato) {
    if (!confirm(`¿Convertir a ${c.nombre_completo} en inquilino?`)) return;
    const sb = createClient();
    const partes = c.nombre_completo.trim().split(' ');
    const nombre = partes[0] ?? c.nombre_completo;
    const apellidos = partes.slice(1).join(' ') || null;
    const id = 'INQ_' + Date.now().toString().slice(-8);
    const { error } = await sb.from('inquilinos').insert({
      id,
      nombre,
      apellidos,
      email: c.email ?? null,
      telefono: c.telefono ?? null,
      dni_nie: c.dni_nie ?? null,
      grupo: c.grupo_flujo ?? null,
      score_inquilino: c.ponderacion_total ?? null,
    });
    if (error) { alert('Error al convertir: ' + error.message); return; }
    await sb.from('candidatos').update({ estado: 'CONVERTIDO' }).eq('id', c.id);
    loadCandidatos();
    load();
  }

  async function rechazarCandidato(id: string) {
    if (!confirm('¿Marcar este candidato como rechazado?')) return;
    const sb = createClient();
    await sb.from('candidatos').update({ estado: 'RECHAZADO' }).eq('id', id);
    loadCandidatos();
  }

  async function load() {
    setLoading(true);
    const sb = createClient();
    const { data, error } = await sb
      .from('inquilinos')
      .select('id, nombre, apellidos, email, telefono, grupo, score_inquilino, blacklist')
      .order('nombre');

    if (error) {
      setDbError(error.message);
      setLoading(false);
      return;
    }
    setInquilinos((data ?? []) as Inquilino[]);
    setDbError(null);
    setLoading(false);
  }

  useEffect(() => { loadCandidatos(); load(); }, []);

  async function openEdit(id: string) {
    const sb = createClient();
    const { data } = await sb
      .from('inquilinos')
      .select('*')
      .eq('id', id)
      .single();
    if (data) setEditTarget({ ...(data as InquilinoFull), _isEdit: true });
    setModalOpen(true);
  }

  async function eliminarInquilino(id: string) {
    if (!confirm('¿Eliminar este inquilino?')) return;
    const sb = createClient();
    const { error } = await sb.from('inquilinos').delete().eq('id', id);
    if (error) alert('No se puede eliminar: ' + error.message); else load();
  }

  function handleSaved() {
    setModalOpen(false);
    setEditTarget(null);
    load();
  }

  const scoreColor = (s: number | null) => {
    if (s == null) return C.g5;
    if (s >= 8) return '#27AE60';
    if (s >= 5) return '#F59E0B';
    return '#EF4444';
  };

  const veredictoStyle = (v: string | null): React.CSSProperties => {
    if (v === 'Apto') return { background: '#D1FAE5', color: '#065F46', padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' as const };
    if (v === 'Revisión manual') return { background: '#FEF3C7', color: '#92400E', padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' as const };
    if (v === 'No apto') return { background: '#FEE2E2', color: '#991B1B', padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' as const };
    return { color: C.g5, fontSize: 11 };
  };

  const thStyle: React.CSSProperties = { padding: '10px 14px', textAlign: 'left', color: '#1E4DB7', fontWeight: 700, fontSize: 11, borderBottom: '2px solid #E2E6EF', whiteSpace: 'nowrap' };
  const tdStyle: React.CSSProperties = { padding: '10px 14px', fontSize: 13, verticalAlign: 'middle' };

  return (
    <div>
      {/* ── Candidatos (Tally) ── */}
      <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: '#1E4DB7' }}>📋 Candidatos (Tally)</h3>
      <div style={{ ...card, marginBottom: 28 }}>
        {loadingCand ? (
          <div style={{ padding: 24, color: C.g5, fontSize: 14 }}>Cargando candidatos…</div>
        ) : candidatos.length === 0 ? (
          <div style={{ padding: '20px 24px', color: C.g5, fontSize: 14 }}>No hay candidatos pendientes.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#F0F4FF' }}>
                  {['Nombre', 'Motivo estancia', 'Ponderación', 'Veredicto', 'Pack', 'Hab. interés', 'Entrada / Salida', 'Acciones'].map(h => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {candidatos.map((c, i) => (
                  <tr key={c.id} style={{ background: i % 2 === 0 ? 'white' : '#F8FAFF', borderBottom: '1px solid #F0F0F0' }}>
                    <td style={{ ...tdStyle, fontWeight: 600, color: '#111827', maxWidth: 160 }}>
                      <div>{c.nombre_completo}</div>
                      {c.email && <div style={{ fontSize: 11, color: C.g5, marginTop: 2 }}>{c.email}</div>}
                    </td>
                    <td style={{ ...tdStyle, color: C.g5, maxWidth: 140 }}>{c.motivo_estancia ?? '—'}</td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: 15, color: c.ponderacion_total != null && c.ponderacion_total >= 70 ? '#27AE60' : c.ponderacion_total != null && c.ponderacion_total >= 40 ? '#F59E0B' : '#EF4444' }}>
                        {c.ponderacion_total ?? '—'}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      {c.veredicto
                        ? <span style={veredictoStyle(c.veredicto)}>{c.veredicto}</span>
                        : <span style={{ color: C.g5 }}>—</span>}
                    </td>
                    <td style={{ ...tdStyle, color: C.g5 }}>{c.pack_escogido ?? '—'}</td>
                    <td style={{ ...tdStyle, color: C.g5 }}>
                      {c.unidad_interes_id ?? '—'}
                      {c.precio_habitacion != null && <div style={{ fontSize: 11, marginTop: 2 }}>{c.precio_habitacion}€/mes</div>}
                    </td>
                    <td style={{ ...tdStyle, color: C.g5, whiteSpace: 'nowrap' }}>
                      {c.fecha_entrada ? new Date(c.fecha_entrada).toLocaleDateString('es-ES') : '—'}
                      {c.fecha_salida && <> → {new Date(c.fecha_salida).toLocaleDateString('es-ES')}</>}
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                        <button
                          onClick={() => convertirCandidato(c)}
                          style={{ background: '#D1FAE5', border: 'none', borderRadius: 8, padding: '5px 10px', fontSize: 12, fontWeight: 600, color: '#065F46', cursor: 'pointer', whiteSpace: 'nowrap' }}
                        >✅ Convertir</button>
                        <button
                          onClick={() => rechazarCandidato(c.id)}
                          style={{ background: '#FEE2E2', border: 'none', borderRadius: 8, padding: '5px 10px', fontSize: 12, fontWeight: 600, color: '#991B1B', cursor: 'pointer' }}
                        >✕</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Pipeline CRM (inquilinos) ── */}
      <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: '#1E4DB7' }}>👥 Pipeline CRM</h3>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
        <button
          onClick={() => { setEditTarget(null); setModalOpen(true); }}
          style={{ padding: '8px 18px', background: '#1E4DB7', color: 'white', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
        >
          + Nuevo Inquilino
        </button>
      </div>

      <div style={card}>
        {loading && (
          <div style={{ padding: 24, color: C.g5, fontSize: 14 }}>Cargando inquilinos…</div>
        )}
        {!loading && dbError && (
          <div style={{ padding: '16px 20px', color: '#EF4444', fontSize: 13, background: '#FEF2F2', borderRadius: 10, margin: 16 }}>
            Error: {dbError}
          </div>
        )}
        {!loading && !dbError && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#F0F4FF' }}>
                  {['Nombre completo', 'Email', 'Teléfono', 'Grupo', 'Score', 'Acciones'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: '#1E4DB7', fontWeight: 700, fontSize: 11, borderBottom: `2px solid #E2E6EF`, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {inquilinos.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '24px 14px', color: C.g5, textAlign: 'center', fontSize: 13 }}>
                      No hay inquilinos registrados.
                    </td>
                  </tr>
                ) : (
                  inquilinos.map((inq: Inquilino, i: number) => (
                    <tr key={inq.id} style={{ background: i % 2 === 0 ? 'white' : '#F8FAFF', borderBottom: `1px solid #F0F0F0` }}>
                      <td style={{ padding: '10px 14px', fontWeight: 600, color: '#111827' }}>
                        {inq.nombre}{inq.apellidos ? ' ' + inq.apellidos : ''}
                        {inq.blacklist && <span style={{ marginLeft: 6, fontSize: 10, background: '#FEE2E2', color: '#EF4444', padding: '1px 6px', borderRadius: 4, fontWeight: 700 }}>BL</span>}
                      </td>
                      <td style={{ padding: '10px 14px', color: C.g5 }}>{inq.email ?? '—'}</td>
                      <td style={{ padding: '10px 14px', color: C.g5 }}>{inq.telefono ?? '—'}</td>
                      <td style={{ padding: '10px 14px' }}>
                        {inq.grupo
                          ? <span style={{ background: '#F0F4FF', color: '#1E4DB7', fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 6 }}>{inq.grupo}</span>
                          : <span style={{ color: C.g5 }}>—</span>
                        }
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{ fontWeight: 700, color: scoreColor(inq.score_inquilino) }}>
                          {inq.score_inquilino != null ? inq.score_inquilino : '—'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                          <button
                            onClick={() => openEdit(inq.id)}
                            style={{ background: '#F0F4FF', border: 'none', borderRadius: 8, padding: '4px 10px', fontSize: 12, fontWeight: 600, color: '#1E4DB7', cursor: 'pointer' }}
                          >✏️ Editar</button>
                          <button
                            onClick={() => eliminarInquilino(inq.id)}
                            style={{ width: 28, height: 28, background: '#FEE2E2', border: 'none', borderRadius: 7, fontSize: 14, color: '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >✕</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <InquilinoModal
          editData={editTarget}
          onClose={() => { setModalOpen(false); setEditTarget(null); }}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
