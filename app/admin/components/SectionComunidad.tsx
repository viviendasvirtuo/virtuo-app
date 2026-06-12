'use client';
import type React from 'react';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { C, card, cardHead, cardBody } from './tokens';

interface PropiedadSimple { id: string; nombre: string; }
interface InquilinoSimple { id: string; nombre: string; apellidos: string | null; }

interface AnuncioRow {
  id: string;
  propiedad_id: string | null;
  tipo: string;
  titulo: string | null;
  mensaje: string | null;
  fecha: string | null;
  propiedades?: { nombre: string }[] | null;
}

interface TareaRow {
  id: string;
  propiedad_id: string | null;
  tarea: string | null;
  inquilino_id: string | null;
  dia_semana: string | null;
  estado: string | null;
  inquilinos?: { nombre: string }[] | null;
  propiedades?: { nombre: string }[] | null;
}

interface AForm { propiedad_id: string; tipo: string; titulo: string; mensaje: string; }
interface TForm { propiedad_id: string; tarea: string; inquilino_id: string; dia_semana: string; }

const NORMAS = [
  '🔇 Silencio de 23:00 a 08:00h',
  '🍳 Cocina limpia tras cada uso',
  '🚿 Baños por rotación semanal',
  '🚪 Puertas cerradas con llave al salir',
  '🐾 Mascotas solo con permiso previo',
  '🎵 Música con auriculares pasada la medianoche',
];

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const inp: React.CSSProperties = {
  width: '100%', padding: '9px 12px', border: '1.5px solid #E2E6EF',
  borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box',
  fontFamily: "'Plus Jakarta Sans', sans-serif",
};

const lbl: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 4 };

function tipoColor(tipo: string): { border: string; bg: string; icon: string } {
  if (tipo === 'warn') return { border: C.y, bg: C.yl, icon: '⚠️' };
  if (tipo === 'ok')   return { border: C.g, bg: C.gl, icon: '🎉' };
  return { border: C.b, bg: C.bl, icon: '📢' };
}

function fechaRelativa(fecha: string | null): string {
  if (!fecha) return '';
  const h = Math.floor((Date.now() - new Date(fecha).getTime()) / 3_600_000);
  if (h < 1) return 'Hace menos de 1h';
  if (h < 24) return `Hace ${h}h`;
  const d = Math.floor(h / 24);
  return d < 30 ? `Hace ${d}d` : new Date(fecha).toLocaleDateString('es-ES');
}

function initiales(nombre: string | null | undefined): string {
  if (!nombre) return '?';
  return nombre.split(' ').map((p: string) => p[0]).join('').slice(0, 2).toUpperCase();
}

const AVATAR_COLORS = [C.b, C.p, C.g, C.y, '#E74C3C', '#16A085'];
function avatarColor(id: string | null): string {
  if (!id) return C.g5;
  let n = 0;
  for (let i = 0; i < id.length; i++) n += id.charCodeAt(i);
  return AVATAR_COLORS[n % AVATAR_COLORS.length];
}

const EMPTY_A: AForm = { propiedad_id: '', tipo: 'info', titulo: '', mensaje: '' };
const EMPTY_T: TForm = { propiedad_id: '', tarea: '', inquilino_id: '', dia_semana: 'Lunes' };

export default function SectionComunidad() {
  const sb = createClient();

  const [propiedades, setPropiedades] = useState<PropiedadSimple[]>([]);
  const [anuncios,    setAnuncios]    = useState<AnuncioRow[]>([]);
  const [tareas,      setTareas]      = useState<TareaRow[]>([]);
  const [inquilinos,  setInquilinos]  = useState<InquilinoSimple[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [showAnu,     setShowAnu]     = useState(false);
  const [showTar,     setShowTar]     = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [aForm,       setAForm]       = useState<AForm>(EMPTY_A);
  const [tForm,       setTForm]       = useState<TForm>(EMPTY_T);

  async function load() {
    setLoading(true);
    const [rP, rA, rT, rI] = await Promise.all([
      sb.from('propiedades').select('id, nombre'),
      sb.from('anuncios').select('id, propiedad_id, tipo, titulo, mensaje, fecha, propiedades(nombre)').order('fecha', { ascending: false }).limit(10),
      sb.from('tareas_comunidad').select('id, propiedad_id, tarea, inquilino_id, dia_semana, estado, inquilinos(nombre), propiedades(nombre)').order('fecha_alta', { ascending: false }).limit(10),
      sb.from('inquilinos').select('id, nombre, apellidos'),
    ]);
    if (rP.data) setPropiedades(rP.data as PropiedadSimple[]);
    if (rA.data) setAnuncios(rA.data as AnuncioRow[]);
    if (rT.data) setTareas(rT.data as TareaRow[]);
    if (rI.data) setInquilinos(rI.data as InquilinoSimple[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function crearAnuncio() {
    if (!aForm.titulo.trim() || !aForm.mensaje.trim()) return;
    setSaving(true);
    await sb.from('anuncios').insert({
      id: 'ANU_' + Date.now().toString().slice(-8),
      propiedad_id: aForm.propiedad_id || null,
      tipo: aForm.tipo, titulo: aForm.titulo, mensaje: aForm.mensaje,
      fecha: new Date().toISOString(),
    });
    setShowAnu(false); setAForm(EMPTY_A);
    await load(); setSaving(false);
  }

  async function crearTarea() {
    if (!tForm.tarea.trim()) return;
    setSaving(true);
    await sb.from('tareas_comunidad').insert({
      id: 'TAR_' + Date.now().toString().slice(-8),
      propiedad_id: tForm.propiedad_id || null,
      tarea: tForm.tarea, inquilino_id: tForm.inquilino_id || null,
      dia_semana: tForm.dia_semana, estado: 'PENDIENTE',
      fecha_alta: new Date().toISOString(),
    });
    setShowTar(false); setTForm(EMPTY_T);
    await load(); setSaving(false);
  }

  async function eliminarAnuncio(id: string) {
    await sb.from('anuncios').delete().eq('id', id);
    await load();
  }

  async function eliminarTarea(id: string) {
    await sb.from('tareas_comunidad').delete().eq('id', id);
    await load();
  }

  async function toggleEstado(t: TareaRow) {
    const nuevo = t.estado === 'COMPLETADA' ? 'PENDIENTE' : 'COMPLETADA';
    await sb.from('tareas_comunidad').update({ estado: nuevo }).eq('id', t.id);
    setTareas((prev: TareaRow[]) => prev.map((x: TareaRow) => x.id === t.id ? { ...x, estado: nuevo } : x));
  }

  const btnDel: React.CSSProperties = { background: C.g1, color: C.g5, border: 'none', borderRadius: 6, width: 20, height: 20, fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, lineHeight: 1 };
  const btnP: React.CSSProperties = { background: C.b, color: '#fff', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' };
  const btnG: React.CSSProperties = { ...btnP, background: C.g1, color: C.g9 };
  const overlay: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 };
  const modal: React.CSSProperties = { background: '#fff', borderRadius: 16, padding: 24, width: '100%', maxWidth: 420, boxShadow: '0 8px 32px rgba(0,0,0,.18)' };

  return (
    <div>
      <style>{`@media(max-width:700px){.com-grid{grid-template-columns:1fr!important}} .est-badge{cursor:pointer;padding:3px 8px;border-radius:20px;font-size:11px;font-weight:700;border:none;} .est-badge:hover{opacity:.8}`}</style>

      {showAnu && (
        <div style={overlay} onClick={() => setShowAnu(false)}>
          <div style={modal} onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 16 }}>📢 Nuevo anuncio</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={lbl}>Piso</label>
                <select style={inp} value={aForm.propiedad_id} onChange={(e: { target: { value: string } }) => setAForm((f: AForm) => ({ ...f, propiedad_id: e.target.value }))}>
                  <option value="">— Sin piso específico —</option>
                  {propiedades.map((p: PropiedadSimple) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Tipo</label>
                <select style={inp} value={aForm.tipo} onChange={(e: { target: { value: string } }) => setAForm((f: AForm) => ({ ...f, tipo: e.target.value }))}>
                  <option value="info">Info</option>
                  <option value="warn">Aviso</option>
                  <option value="ok">Positivo</option>
                </select>
              </div>
              <div>
                <label style={lbl}>Título</label>
                <input style={inp} value={aForm.titulo} onChange={(e: { target: { value: string } }) => setAForm((f: AForm) => ({ ...f, titulo: e.target.value }))} placeholder="Título del anuncio" />
              </div>
              <div>
                <label style={lbl}>Mensaje</label>
                <textarea style={{ ...inp, minHeight: 80, resize: 'vertical' }} value={aForm.mensaje} onChange={(e: { target: { value: string } }) => setAForm((f: AForm) => ({ ...f, mensaje: e.target.value }))} placeholder="Escribe el mensaje…" />
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
                <button style={btnG} onClick={() => setShowAnu(false)}>Cancelar</button>
                <button style={btnP} onClick={crearAnuncio} disabled={saving}>{saving ? 'Guardando…' : 'Publicar'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showTar && (
        <div style={overlay} onClick={() => setShowTar(false)}>
          <div style={modal} onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 16 }}>🧹 Nueva tarea</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={lbl}>Piso</label>
                <select style={inp} value={tForm.propiedad_id} onChange={(e: { target: { value: string } }) => setTForm((f: TForm) => ({ ...f, propiedad_id: e.target.value }))}>
                  <option value="">— Sin piso específico —</option>
                  {propiedades.map((p: PropiedadSimple) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Tarea</label>
                <input style={inp} value={tForm.tarea} onChange={(e: { target: { value: string } }) => setTForm((f: TForm) => ({ ...f, tarea: e.target.value }))} placeholder="Descripción de la tarea" />
              </div>
              <div>
                <label style={lbl}>Inquilino responsable</label>
                <select style={inp} value={tForm.inquilino_id} onChange={(e: { target: { value: string } }) => setTForm((f: TForm) => ({ ...f, inquilino_id: e.target.value }))}>
                  <option value="">— Sin asignar —</option>
                  {inquilinos.map((i: InquilinoSimple) => <option key={i.id} value={i.id}>{i.nombre} {i.apellidos ?? ''}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Día de la semana</label>
                <select style={inp} value={tForm.dia_semana} onChange={(e: { target: { value: string } }) => setTForm((f: TForm) => ({ ...f, dia_semana: e.target.value }))}>
                  {DIAS.map((d: string) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
                <button style={btnG} onClick={() => setShowTar(false)}>Cancelar</button>
                <button style={btnP} onClick={crearTarea} disabled={saving}>{saving ? 'Guardando…' : 'Crear tarea'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="com-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {/* Anuncios */}
        <div>
          <div style={{ ...card }}>
            <div style={{ ...cardHead, justifyContent: 'space-between' }}>
              <span>📢 Anuncios del piso</span>
              <button style={btnP} onClick={() => setShowAnu(true)}>+ Nuevo anuncio</button>
            </div>
            <div style={cardBody}>
              {loading ? (
                <div style={{ color: C.g5, fontSize: 13, textAlign: 'center', padding: '16px 0' }}>Cargando…</div>
              ) : anuncios.length === 0 ? (
                <div style={{ color: C.g5, fontSize: 13, textAlign: 'center', padding: '20px 0' }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>📭</div>
                  <div>No hay anuncios todavía</div>
                </div>
              ) : anuncios.map((a: AnuncioRow, i: number) => {
                const { border, bg, icon } = tipoColor(a.tipo);
                return (
                  <div key={a.id} style={{ background: bg, border: `1.5px solid ${border}`, borderRadius: 10, padding: '12px 14px', marginBottom: i < anuncios.length - 1 ? 10 : 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                      <span style={{ fontSize: 16 }}>{icon}</span>
                      <span style={{ fontWeight: 700, fontSize: 13, color: C.g9 }}>{a.titulo}</span>
                      <span style={{ marginLeft: 'auto', fontSize: 10, color: C.g5, whiteSpace: 'nowrap' }}>{fechaRelativa(a.fecha)}</span>
                      <button style={btnDel} onClick={() => eliminarAnuncio(a.id)} title="Eliminar" onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => { (e.currentTarget as HTMLButtonElement).style.background = C.rl; (e.currentTarget as HTMLButtonElement).style.color = C.r; }} onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => { (e.currentTarget as HTMLButtonElement).style.background = C.g1; (e.currentTarget as HTMLButtonElement).style.color = C.g5; }}>✕</button>
                    </div>
                    <div style={{ fontSize: 12.5, color: C.g9, lineHeight: 1.5 }}>{a.mensaje}</div>
                    {a.propiedades?.[0]?.nombre && (
                      <div style={{ marginTop: 5, fontSize: 11, color: C.g5 }}>🏠 {a.propiedades[0].nombre}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tareas + Normas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={card}>
            <div style={{ ...cardHead, justifyContent: 'space-between' }}>
              <span>🧹 Tareas de comunidad</span>
              <button style={btnP} onClick={() => setShowTar(true)}>+ Nueva tarea</button>
            </div>
            <div style={cardBody}>
              {loading ? (
                <div style={{ color: C.g5, fontSize: 13, textAlign: 'center', padding: '16px 0' }}>Cargando…</div>
              ) : tareas.length === 0 ? (
                <div style={{ color: C.g5, fontSize: 13, textAlign: 'center', padding: '20px 0' }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>✅</div>
                  <div>No hay tareas asignadas</div>
                </div>
              ) : tareas.map((t: TareaRow, i: number) => {
                const completada = t.estado === 'COMPLETADA';
                const nombre = t.inquilinos?.[0]?.nombre ?? null;
                return (
                  <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < tareas.length - 1 ? `1px solid ${C.g1}` : 'none' }}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: avatarColor(t.inquilino_id), color: '#fff', fontWeight: 700, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {initiales(nombre)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.g9, textDecoration: completada ? 'line-through' : 'none', opacity: completada ? 0.6 : 1 }}>{t.tarea}</div>
                      <div style={{ fontSize: 11, color: C.g5 }}>{nombre ?? 'Sin asignar'} · {t.dia_semana}</div>
                    </div>
                    <button className="est-badge" style={{ background: completada ? C.gl : C.yl, color: completada ? C.g : C.y }} onClick={() => toggleEstado(t)}>
                      {completada ? 'COMPLETADA' : 'PENDIENTE'}
                    </button>
                    <button style={btnDel} onClick={() => eliminarTarea(t.id)} title="Eliminar" onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => { (e.currentTarget as HTMLButtonElement).style.background = C.rl; (e.currentTarget as HTMLButtonElement).style.color = C.r; }} onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => { (e.currentTarget as HTMLButtonElement).style.background = C.g1; (e.currentTarget as HTMLButtonElement).style.color = C.g5; }}>✕</button>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ ...card, marginBottom: 0 }}>
            <div style={cardHead}>📋 Normas de convivencia</div>
            <div style={cardBody}>
              {NORMAS.map((n: string, i: number) => (
                <div key={i} style={{ fontSize: 13, color: C.g9, padding: '6px 0', borderBottom: i < NORMAS.length - 1 ? `1px solid ${C.g1}` : 'none' }}>{n}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
