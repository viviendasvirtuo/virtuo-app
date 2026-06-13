'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface WikiPiso {
  wifi_red?: string;
  wifi_password?: string;
  termostato?: string;
  lavadora?: string;
  basura?: string;
  otros?: string;
}

interface Estancia {
  id: string;
  renta_mensual: number;
  fecha_entrada: string;
  fecha_salida_prevista: string;
  inquilinos: {
    id: string;
    nombre: string;
    apellidos: string;
    email: string;
  };
  unidades: {
    id: string;
    nombre: string;
    propiedad_id: string;
    propiedades: {
      nombre: string;
      wifi_nombre: string;
      wifi_password: string;
      wiki_piso: WikiPiso | null;
    };
  };
}

interface Pago {
  id: string;
  mes_facturado: string;
  importe: number;
  estado: string;
  fecha_vencimiento: string;
  fecha_pago: string | null;
}

interface Incidencia {
  id: string;
  tipo: string;
  descripcion: string;
  prioridad: string;
  estado: string;
  fecha_reporte: string;
}

// ── Códigos de acceso cortos → unidad_id ───────────────────────
const codigosAcceso: Record<string, string> = {
  '123456': 'UNIT_SANTS_HAB1',
};

// ── Design tokens ──────────────────────────────────────────────
const C = {
  primary:   '#1E4DB7',
  secondary: '#2E86DE',
  green:     '#27AE60',
  bg:        '#F0F4FF',
  border:    '#E2E6EF',
  white:     '#FFFFFF',
  gray50:    '#F8FAFF',
  gray100:   '#F3F4F6',
  gray400:   '#9CA3AF',
  gray500:   '#6B7280',
  gray700:   '#374151',
  gray900:   '#111827',
  amber:     '#F59E0B',
  red:       '#EF4444',
};

const FONT = "var(--font-jakarta, 'Plus Jakarta Sans', system-ui, sans-serif)";

const card: React.CSSProperties = {
  background: C.white,
  borderRadius: '14px',
  boxShadow: '0 2px 12px rgba(30,77,183,0.07)',
  border: `1px solid ${C.border}`,
  marginBottom: '14px',
  overflow: 'hidden',
};

const cardHead: React.CSSProperties = {
  padding: '16px 20px 12px',
  fontSize: '14px',
  fontWeight: '700',
  color: C.primary,
  borderBottom: `1px solid ${C.border}`,
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
};

const label: React.CSSProperties = {
  display: 'block',
  fontSize: '12px',
  fontWeight: '600',
  color: C.gray500,
  marginBottom: '5px',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};

const value: React.CSSProperties = {
  margin: 0,
  fontWeight: '700',
  fontSize: '15px',
  color: C.gray900,
};

// ── Component ──────────────────────────────────────────────────
export default function PortalPage() {
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [estancia, setEstancia] = useState<Estancia | null>(null);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [incidencias, setIncidencias] = useState<Incidencia[]>([]);

  const [wikiAbierto, setWikiAbierto] = useState<string | null>(null);
  const [mostrarFormInc, setMostrarFormInc] = useState(false);
  const [incTipo, setIncTipo] = useState('');
  const [incDesc, setIncDesc] = useState('');
  const [incPrioridad, setIncPrioridad] = useState('media');
  const [incEnviando, setIncEnviando] = useState(false);
  const [incExito, setIncExito] = useState(false);
  const [incError, setIncError] = useState('');

  const sb = createClient();

  async function handleLogin() {
    if (!codigo.trim()) return;
    setLoading(true);
    setError('');

    const raw = codigo.trim();
    const unidadId = codigosAcceso[raw] ?? raw.toUpperCase();

    const { data: estanciaData, error: estanciaError } = await sb
      .from('estancias')
      .select('id, renta_mensual, fecha_entrada, fecha_salida_prevista, inquilinos(id, nombre, apellidos, email), unidades(id, nombre, propiedad_id, propiedades(nombre, wifi_nombre, wifi_password, wiki_piso))')
      .eq('unidad_id', unidadId)
      .eq('estado', 'ACTIVA')
      .single();

    if (estanciaError || !estanciaData) {
      setError('Código de acceso no válido. Comprueba que es correcto.');
      setLoading(false);
      return;
    }

    setEstancia(estanciaData as unknown as Estancia);

    const { data: pagosData } = await sb
      .from('pagos')
      .select('id, mes_facturado, importe, estado, fecha_vencimiento, fecha_pago')
      .eq('estancia_id', estanciaData.id)
      .order('fecha_vencimiento', { ascending: false })
      .limit(6);

    setPagos((pagosData as Pago[]) || []);

    const { data: incidenciasData } = await sb
      .from('incidencias')
      .select('id, tipo, descripcion, prioridad, estado, fecha_reporte')
      .eq('unidad_id', unidadId)
      .order('fecha_reporte', { ascending: false })
      .limit(5);

    setIncidencias((incidenciasData as Incidencia[]) || []);
    setLoading(false);
  }

  async function handleReportarIncidencia() {
    if (!incTipo || !incDesc.trim()) {
      setIncError('Completa el tipo y la descripción.');
      return;
    }
    if (!estancia) return;
    setIncEnviando(true);
    setIncError('');

    const incId = 'INC_' + Date.now().toString().slice(-8);
    const unidadId = codigosAcceso[codigo.trim()] ?? codigo.trim().toUpperCase();

    const { error: insertError } = await sb.from('incidencias').insert({
      id: incId,
      propiedad_id: estancia.unidades.propiedad_id,
      unidad_id: unidadId,
      estancia_id: estancia.id,
      reportado_por: estancia.inquilinos.id,
      tipo: incTipo,
      descripcion: incDesc.trim(),
      prioridad: incPrioridad,
      estado: 'ABIERTA',
      sla_horas: 48,
      fecha_reporte: new Date().toISOString(),
    });

    if (insertError) {
      setIncError('Error al enviar. Inténtalo de nuevo.');
      setIncEnviando(false);
      return;
    }

    const { data: inc2 } = await sb
      .from('incidencias')
      .select('id, tipo, descripcion, prioridad, estado, fecha_reporte')
      .eq('unidad_id', unidadId)
      .order('fecha_reporte', { ascending: false })
      .limit(5);
    setIncidencias((inc2 as Incidencia[]) || []);

    setIncTipo('');
    setIncDesc('');
    setIncPrioridad('media');
    setIncEnviando(false);
    setIncExito(true);
    setMostrarFormInc(false);
    setTimeout(() => setIncExito(false), 5000);
  }

  // ── Login screen ────────────────────────────────────────────
  if (!estancia) {
    return (
      <main style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: FONT }}>
        <div style={{ background: C.white, borderRadius: '20px', padding: '40px 36px', width: '100%', maxWidth: '420px', boxShadow: '0 8px 32px rgba(30,77,183,0.12)', border: `1px solid ${C.border}` }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: `linear-gradient(135deg, ${C.primary}, ${C.secondary})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', margin: '0 auto 16px' }}>🏠</div>
            <h1 style={{ fontSize: '22px', fontWeight: '800', color: C.primary, margin: '0 0 6px' }}>Portal Inquilino</h1>
            <p style={{ color: C.gray400, fontSize: '13px', margin: 0 }}>Viviendas Virtuo · R&R Property Mgmt</p>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ ...label, textTransform: 'none', fontSize: '13px', letterSpacing: 0 }}>
              Código de acceso
            </label>
            <input
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="Código de acceso"
              style={{ width: '100%', padding: '13px 16px', border: `2px solid ${C.border}`, borderRadius: '10px', fontSize: '15px', outline: 'none', boxSizing: 'border-box', fontFamily: FONT, color: C.gray900 }}
            />
          </div>

          {error && (
            <p style={{ color: C.red, fontSize: '13px', marginBottom: '16px', padding: '10px 14px', background: '#FEF2F2', borderRadius: '8px', margin: '0 0 16px' }}>
              {error}
            </p>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{ width: '100%', padding: '14px', background: `linear-gradient(135deg, ${C.primary}, ${C.secondary})`, color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: FONT, letterSpacing: '0.01em' }}
          >
            {loading ? 'Buscando...' : 'Acceder →'}
          </button>

          <p style={{ textAlign: 'center', fontSize: '12px', color: C.gray400, marginTop: '16px' }}>
            Tu código está en tu contrato o pregunta a tu gestor
          </p>
        </div>
      </main>
    );
  }

  // ── Dashboard ────────────────────────────────────────────────
  const inq  = estancia.inquilinos;
  const uni  = estancia.unidades;
  const prop = estancia.unidades.propiedades;

  const estadoColor: Record<string, string> = {
    PAGADO: C.green, PENDIENTE: C.amber, VENCIDO: C.red,
  };
  const prioridadColor: Record<string, string> = {
    alta: C.red, media: C.amber, baja: C.green,
  };

  // Primer pago pendiente (o el más reciente) se destaca
  const pagoDestacadoId = pagos.find((p) => p.estado === 'PENDIENTE')?.id ?? pagos[0]?.id;

  const tieneWifi = !!(prop.wifi_nombre || prop.wifi_password);

  return (
    <main style={{ minHeight: '100vh', background: C.bg, padding: '20px 16px 40px', fontFamily: FONT }}>
      <div className="max-w-7xl mx-auto" style={{ padding: '0 4px' }}>

        {/* ── Header bienvenida ── */}
        <div style={{
          background: `linear-gradient(135deg, ${C.primary} 0%, ${C.secondary} 100%)`,
          borderRadius: '16px',
          padding: '24px 24px 20px',
          marginBottom: '14px',
          color: 'white',
          boxShadow: '0 4px 20px rgba(30,77,183,0.22)',
        }}>
          <p style={{ margin: '0 0 4px', fontSize: '12px', opacity: 0.75, fontWeight: '500', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Bienvenido/a</p>
          <h1 style={{ margin: '0 0 6px', fontSize: '22px', fontWeight: '800', lineHeight: 1.2 }}>{inq.nombre} {inq.apellidos}</h1>
          <p style={{ margin: 0, fontSize: '13px', opacity: 0.85, fontWeight: '500' }}>{prop.nombre} &nbsp;·&nbsp; {uni.nombre}</p>
        </div>

        {/* ── Grid 2 columnas: Guía + Estancia + Pagos ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr] gap-4" style={{ alignItems: 'start', marginBottom: '14px' }}>

        {/* ── Wiki del piso ── */}
        {(() => {
          const wiki = prop.wiki_piso;
          const items: { key: keyof WikiPiso; icon: string; titulo: string }[] = [
            { key: 'wifi_red',    icon: '📡', titulo: 'WiFi' },
            { key: 'termostato', icon: '🌡️', titulo: 'Termostato / Calefacción' },
            { key: 'lavadora',   icon: '🧺', titulo: 'Lavadora' },
            { key: 'basura',     icon: '🗑️', titulo: 'Recogida de basura' },
            { key: 'otros',      icon: 'ℹ️', titulo: 'Otros' },
          ];
          const visibles = wiki ? items.filter(it => wiki[it.key]?.trim()) : [];

          return (
            <div style={{ ...card, marginBottom: '14px' }}>
              <div style={{ ...cardHead }}>📖 Guía del piso</div>
              <div style={{ padding: '12px 20px' }}>
                {!wiki || visibles.length === 0 ? (
                  <p style={{ margin: 0, fontSize: '13px', color: C.gray400 }}>
                    La guía del piso aún no está disponible.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 items-start">
                    {visibles.map(({ key, icon, titulo }) => {
                      const abierto = wikiAbierto === key;
                      return (
                        <div key={key} style={{ border: `1px solid ${C.border}`, borderRadius: '10px', overflow: 'hidden' }}>
                          <button
                            onClick={() => setWikiAbierto(abierto ? null : key)}
                            style={{
                              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              padding: '11px 14px', background: abierto ? C.bg : C.white,
                              border: 'none', cursor: 'pointer', fontFamily: FONT, textAlign: 'left',
                            }}
                          >
                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '600', color: C.gray900 }}>
                              <span>{icon}</span>{titulo}
                            </span>
                            <span style={{ fontSize: '12px', color: C.gray400, flexShrink: 0 }}>{abierto ? '▲' : '▼'}</span>
                          </button>
                          {abierto && (
                            <div style={{ padding: '10px 14px 13px', borderTop: `1px solid ${C.border}`, background: C.white }}>
                              <p style={{ margin: 0, fontSize: '13px', color: C.gray700, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                                {wiki[key]}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* ── Tu estancia ── */}
        <div style={card}>
          <div style={cardHead}>📋 Tu estancia</div>
          <div style={{ padding: '16px 20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: tieneWifi ? '1fr 1fr' : '1fr 1fr', gap: '16px 24px' }}>
              <div>
                <p style={label}>Renta mensual</p>
                <p style={{ ...value, color: C.primary }}>{estancia.renta_mensual}€</p>
              </div>
              <div>
                <p style={label}>Entrada</p>
                <p style={value}>{new Date(estancia.fecha_entrada).toLocaleDateString('es-ES')}</p>
              </div>
              <div>
                <p style={label}>Fin previsto</p>
                <p style={value}>{new Date(estancia.fecha_salida_prevista).toLocaleDateString('es-ES')}</p>
              </div>
              {tieneWifi && (
                <div>
                  <p style={label}>WiFi</p>
                  <p style={value}>{prop.wifi_nombre}</p>
                </div>
              )}
            </div>
            {tieneWifi && prop.wifi_password && (
              <div style={{ marginTop: '14px', padding: '10px 14px', background: C.bg, borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px' }}>🔑</span>
                <span style={{ fontSize: '13px', color: C.gray700 }}>Contraseña WiFi: <strong style={{ color: C.gray900 }}>{prop.wifi_password}</strong></span>
              </div>
            )}
          </div>
        </div>

        {/* ── Mis pagos ── */}
        <div style={card}>
          <div style={cardHead}>💰 Mis pagos</div>
          <div style={{ padding: '4px 0' }}>
            {pagos.length === 0 ? (
              <p style={{ color: C.gray400, fontSize: '14px', padding: '16px 20px' }}>No hay pagos registrados.</p>
            ) : (
              pagos.map((p, idx) => {
                const destacado = p.id === pagoDestacadoId;
                return (
                  <div
                    key={p.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 20px',
                      borderBottom: idx < pagos.length - 1 ? `1px solid ${C.gray100}` : 'none',
                      background: destacado ? '#FFFBEB' : 'transparent',
                      borderLeft: destacado ? `3px solid ${C.amber}` : '3px solid transparent',
                    }}
                  >
                    <div>
                      <p style={{ margin: '0 0 2px', fontWeight: '700', fontSize: '14px', color: C.gray900 }}>{p.mes_facturado}</p>
                      <p style={{ margin: 0, fontSize: '12px', color: C.gray400 }}>Vence: {new Date(p.fecha_vencimiento).toLocaleDateString('es-ES')}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ margin: '0 0 3px', fontWeight: '800', fontSize: '16px', color: C.gray900 }}>{p.importe}€</p>
                      <span style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: '700',
                        background: (estadoColor[p.estado] || C.gray400) + '20',
                        color: estadoColor[p.estado] || C.gray400,
                      }}>{p.estado}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        </div>{/* fin grid 2 columnas */}

        {/* ── Mis incidencias + formulario ── */}
        <div style={card}>
          <div style={{ ...cardHead, justifyContent: 'space-between' }}>
            <span>🔧 Mis incidencias</span>
            <button
              onClick={() => { setMostrarFormInc(!mostrarFormInc); setIncError(''); }}
              style={{
                padding: '6px 12px',
                background: mostrarFormInc ? C.gray100 : '#FFF8E1',
                color: mostrarFormInc ? C.gray500 : '#92400E',
                border: `1px solid ${mostrarFormInc ? C.border : '#FCD34D'}`,
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                fontFamily: FONT,
                whiteSpace: 'nowrap',
              }}
            >
              {mostrarFormInc ? '✕ Cancelar' : '⚠️ Reportar'}
            </button>
          </div>

          <div style={{ padding: '12px 20px' }}>

            {/* Confirmación envío */}
            {incExito && (
              <div style={{ marginBottom: '14px', padding: '12px 14px', background: '#F0FDF4', border: `1px solid #86EFAC`, borderRadius: '10px', color: '#15803D', fontSize: '13px', fontWeight: '600' }}>
                ✅ Incidencia enviada. Te contactaremos en menos de 48 h.
              </div>
            )}

            {/* Formulario */}
            {mostrarFormInc && (
              <div style={{ marginBottom: '16px', padding: '16px', background: C.gray50, border: `1px solid ${C.border}`, borderRadius: '12px' }}>
                <div style={{ marginBottom: '12px' }}>
                  <label style={label}>Tipo *</label>
                  <select
                    value={incTipo}
                    onChange={(e) => setIncTipo(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', border: `2px solid ${C.border}`, borderRadius: '8px', fontSize: '14px', background: C.white, outline: 'none', boxSizing: 'border-box', fontFamily: FONT, color: C.gray900 }}
                  >
                    <option value="">Selecciona una categoría…</option>
                    <option value="fontaneria">Fontanería</option>
                    <option value="electricidad">Electricidad</option>
                    <option value="limpieza">Limpieza</option>
                    <option value="cerrajeria">Cerrajería</option>
                    <option value="climatizacion">Climatización</option>
                    <option value="otros">Otros</option>
                  </select>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={label}>Descripción *</label>
                  <textarea
                    value={incDesc}
                    onChange={(e) => setIncDesc(e.target.value)}
                    placeholder="Describe el problema con el máximo detalle posible…"
                    rows={4}
                    style={{ width: '100%', padding: '10px 12px', border: `2px solid ${C.border}`, borderRadius: '8px', fontSize: '14px', resize: 'vertical', outline: 'none', boxSizing: 'border-box', fontFamily: FONT, color: C.gray900 }}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={label}>Prioridad</label>
                  <select
                    value={incPrioridad}
                    onChange={(e) => setIncPrioridad(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', border: `2px solid ${C.border}`, borderRadius: '8px', fontSize: '14px', background: C.white, outline: 'none', boxSizing: 'border-box', fontFamily: FONT, color: C.gray900 }}
                  >
                    <option value="alta">🔴 Alta — urgente</option>
                    <option value="media">🟡 Media — esta semana</option>
                    <option value="baja">🟢 Baja — cuando puedas</option>
                  </select>
                </div>

                {incError && (
                  <p style={{ color: C.red, fontSize: '13px', marginBottom: '12px', padding: '10px 12px', background: '#FEF2F2', borderRadius: '8px' }}>
                    {incError}
                  </p>
                )}

                <button
                  onClick={handleReportarIncidencia}
                  disabled={incEnviando}
                  style={{ width: '100%', padding: '13px', background: incEnviando ? '#93AADA' : `linear-gradient(135deg, ${C.primary}, ${C.secondary})`, color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: incEnviando ? 'not-allowed' : 'pointer', fontFamily: FONT }}
                >
                  {incEnviando ? 'Enviando…' : 'Enviar incidencia'}
                </button>
              </div>
            )}

            {/* Lista */}
            {incidencias.length === 0 ? (
              <p style={{ color: C.gray400, fontSize: '14px', margin: 0 }}>No hay incidencias registradas.</p>
            ) : (
              incidencias.map((inc, idx) => (
                <div key={inc.id} style={{ padding: '12px 0', borderBottom: idx < incidencias.length - 1 ? `1px solid ${C.gray100}` : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                    <p style={{ margin: 0, fontWeight: '700', fontSize: '14px', color: C.gray900, textTransform: 'capitalize' }}>{inc.tipo}</p>
                    <span style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: '20px',
                      fontSize: '10px',
                      fontWeight: '700',
                      background: (prioridadColor[inc.prioridad] || C.gray400) + '22',
                      color: prioridadColor[inc.prioridad] || C.gray400,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      flexShrink: 0,
                      marginLeft: '8px',
                    }}>{inc.prioridad}</span>
                  </div>
                  <p style={{ margin: '0 0 4px', fontSize: '13px', color: C.gray500 }}>{inc.descripcion}</p>
                  <span style={{ fontSize: '11px', color: C.gray400 }}>{inc.estado} · {new Date(inc.fecha_reporte).toLocaleDateString('es-ES')}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── Cerrar sesión ── */}
        <button
          onClick={() => { setEstancia(null); setCodigo(''); }}
          style={{
            width: '100%',
            padding: '12px',
            background: 'transparent',
            color: C.gray500,
            border: `1px solid ${C.border}`,
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
            fontFamily: FONT,
            marginTop: '4px',
          }}
        >
          Cerrar sesión
        </button>

      </div>
    </main>
  );
}
