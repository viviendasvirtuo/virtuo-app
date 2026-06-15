'use client';

import React, { useState } from 'react';
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
  renovacion_estado: string | null;
  renovacion_fecha: string | null;
  renovacion_meses_solicitados: number | null;
  renovacion_fecha_solicitada: string | null;
  renovacion_hay_vacante: boolean | null;
  renovacion_respuesta: string | null;
  renovacion_respuesta_motivo: string | null;
  renovacion_respuesta_fecha: string | null;
  fianza: number | null;
  fianza_devuelta: boolean | null;
  fianza_devuelta_fecha: string | null;
  fianza_retencion_motivo: string | null;
  checkout_completado: boolean | null;
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

interface DocRow { tipo: string; nombre: string; fecha: string; url: string; }

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

  // ── Documentos ──────────────────────────────────────────────
  const [docsExistentes, setDocsExistentes] = useState<DocRow[]>([]);
  const [docSubiendo, setDocSubiendo] = useState<Record<string, boolean>>({});
  const [docReemplazar, setDocReemplazar] = useState<Record<string, boolean>>({});
  const [docError, setDocError] = useState<Record<string, string>>({});
  const [docExito, setDocExito] = useState<Record<string, boolean>>({});
  const [mostrarFormInc, setMostrarFormInc] = useState(false);
  const [incTipo, setIncTipo] = useState('');
  const [incDesc, setIncDesc] = useState('');
  const [incPrioridad, setIncPrioridad] = useState('media');
  const [incEnviando, setIncEnviando] = useState(false);
  const [incSubiendo, setIncSubiendo] = useState(false);
  const [incArchivo, setIncArchivo] = useState<File | null>(null);
  const [incExito, setIncExito] = useState(false);
  const [renovacionEnviada, setRenovacionEnviada] = useState(false);
  const [renovacionGuardando, setRenovacionGuardando] = useState(false);
  const [mostrarFormProrroga, setMostrarFormProrroga] = useState(false);
  const [mesesSolicitados, setMesesSolicitados] = useState(1);
  const [renovacionFechaSolicitada, setRenovacionFechaSolicitada] = useState<string | null>(null);
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
      .select('id, renta_mensual, fecha_entrada, fecha_salida_prevista, renovacion_estado, renovacion_fecha, renovacion_fecha_solicitada, renovacion_respuesta, renovacion_respuesta_motivo, renovacion_respuesta_fecha, fianza, fianza_devuelta, fianza_devuelta_fecha, fianza_retencion_motivo, checkout_completado, inquilinos(id, nombre, apellidos, email), unidades(id, nombre, propiedad_id, propiedades(nombre, wifi_nombre, wifi_password, wiki_piso))')
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

    const { data: docsData } = await sb
      .from('documentos')
      .select('tipo, nombre, fecha, url')
      .eq('estancia_id', estanciaData.id);
    setDocsExistentes((docsData as DocRow[]) || []);

    setLoading(false);
  }

  async function handleReportarIncidencia() {
    if (!incTipo || !incDesc.trim()) {
      setIncError('Completa el tipo y la descripción.');
      return;
    }
    if (!incArchivo) {
      setIncError('Debes adjuntar una foto o vídeo del problema.');
      return;
    }
    if (!estancia) return;
    setIncEnviando(true);
    setIncError('');

    const incId = 'INC_' + Date.now().toString().slice(-8);
    const unidadId = codigosAcceso[codigo.trim()] ?? codigo.trim().toUpperCase();

    // ── Subida del archivo a Storage ──
    setIncSubiendo(true);
    const ts = Date.now();
    const safeName = incArchivo.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `${unidadId}/${ts}_${safeName}`;
    const { error: uploadError } = await sb.storage
      .from('incidencias')
      .upload(storagePath, incArchivo, { upsert: false });
    setIncSubiendo(false);

    if (uploadError) {
      setIncError('Error al subir el archivo: ' + uploadError.message);
      setIncEnviando(false);
      return;
    }

    const { data: publicUrlData } = sb.storage
      .from('incidencias')
      .getPublicUrl(storagePath);
    const mediaUrl = publicUrlData.publicUrl;
    const esVideo = incArchivo.type.startsWith('video/');

    // ── Insert incidencia ──
    const { error: insertError } = await sb.from('incidencias').insert({
      id: incId,
      propiedad_id: estancia.unidades.propiedad_id,
      unidad_id: unidadId,
      estancia_id: estancia.id,
      reportado_por: estancia.inquilinos.id,
      tipo: incTipo,
      descripcion: incDesc.trim(),
      prioridad: incPrioridad,
      sla_horas: 48,
      fecha_reporte: new Date().toISOString(),
      ...(esVideo ? { video_url: mediaUrl } : { foto_antes_url: mediaUrl }),
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
    setIncArchivo(null);
    setIncEnviando(false);
    setIncExito(true);
    setMostrarFormInc(false);
    setTimeout(() => setIncExito(false), 5000);
  }

  async function handleSubirDocumento(tipo: string, archivo: File) {
    if (!estancia) return;
    setDocSubiendo(s => ({ ...s, [tipo]: true }));
    setDocError(e => ({ ...e, [tipo]: '' }));
    setDocExito(x => ({ ...x, [tipo]: false }));
    const unidadId = codigosAcceso[codigo.trim()] ?? codigo.trim().toUpperCase();
    const ts = Date.now();
    const safeName = archivo.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `${unidadId}/${tipo}_${ts}_${safeName}`;
    try {
      console.log(`[docs] Subiendo a Storage: ${storagePath}`);
      const { error: uploadError } = await sb.storage
        .from('documentos')
        .upload(storagePath, archivo, { upsert: false });
      if (uploadError) {
        console.error('[docs] Error Storage:', uploadError);
        setDocError(e => ({ ...e, [tipo]: 'Error al subir el archivo: ' + uploadError.message }));
        setDocSubiendo(s => ({ ...s, [tipo]: false }));
        return;
      }
      console.log('[docs] Storage OK. Guardando en BD...');

      const upsertPayload = {
        id: `DOC_${tipo}_${estancia.id}`,
        inquilino_id: estancia.inquilinos.id,
        estancia_id: estancia.id,
        tipo,
        nombre: archivo.name,
        url: storagePath,
        fecha: new Date().toISOString().slice(0, 10),
      };
      const { error: dbError } = await sb.from('documentos').upsert(upsertPayload, { onConflict: 'id' });
      if (dbError) {
        console.error('[docs] Error BD:', dbError);
        setDocError(e => ({ ...e, [tipo]: 'Error al guardar en base de datos: ' + dbError.message }));
        setDocSubiendo(s => ({ ...s, [tipo]: false }));
        return;
      }
      console.log('[docs] BD OK. Refrescando lista...');

      const { data: docsData, error: fetchError } = await sb.from('documentos').select('tipo, nombre, fecha, url').eq('estancia_id', estancia.id);
      if (fetchError) console.error('[docs] Error al refrescar lista:', fetchError);
      setDocsExistentes((docsData as DocRow[]) || []);
      setDocSubiendo(s => ({ ...s, [tipo]: false }));
      setDocReemplazar(r => ({ ...r, [tipo]: false }));
      setDocExito(x => ({ ...x, [tipo]: true }));
      setTimeout(() => setDocExito(x => ({ ...x, [tipo]: false })), 4000);
    } catch (err) {
      console.error('[docs] Error inesperado:', err);
      setDocError(e => ({ ...e, [tipo]: 'Error inesperado. Inténtalo de nuevo.' }));
      setDocSubiendo(s => ({ ...s, [tipo]: false }));
    }
  }

  async function handleRenovacion(accion: 'SALIDA_CONFIRMADA') {
    if (!estancia) return;
    setRenovacionGuardando(true);
    await sb.from('estancias').update({ renovacion_estado: accion, renovacion_fecha: new Date().toISOString() }).eq('id', estancia.id);
    setEstancia(e => e ? { ...e, renovacion_estado: accion, renovacion_fecha: new Date().toISOString() } : e);
    setRenovacionEnviada(true);
    setRenovacionGuardando(false);
  }

  async function handleSolicitarProrroga() {
    if (!estancia) return;
    setRenovacionGuardando(true);
    const salida = new Date(estancia.fecha_salida_prevista);
    const fechaSol = new Date(salida);
    fechaSol.setMonth(fechaSol.getMonth() + mesesSolicitados);
    const fechaSolStr = fechaSol.toISOString().slice(0, 10);

    // Comprobar conflicto: otra estancia en la misma unidad que empiece entre salida actual y fecha solicitada
    const { data: conflictos } = await sb.from('estancias')
      .select('id')
      .eq('unidad_id', estancia.unidades.id)
      .neq('id', estancia.id)
      .in('estado', ['RESERVA', 'CONTRATO', 'ACTIVA'])
      .gte('fecha_entrada', estancia.fecha_salida_prevista)
      .lte('fecha_entrada', fechaSolStr);
    const hayVacante = !conflictos || conflictos.length === 0;

    await sb.from('estancias').update({
      renovacion_estado: 'PRORROGA_SOLICITADA',
      renovacion_fecha: new Date().toISOString(),
      renovacion_meses_solicitados: mesesSolicitados,
      renovacion_fecha_solicitada: fechaSolStr,
      renovacion_hay_vacante: hayVacante,
    }).eq('id', estancia.id);

    setRenovacionFechaSolicitada(fechaSolStr);
    setRenovacionEnviada(true);
    setMostrarFormProrroga(false);
    setRenovacionGuardando(false);
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
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8" style={{}}>

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

        {/* ── Banner renovación ── */}
        {(() => {
          if (!estancia.fecha_salida_prevista) return null;

          // Si hay renovacion_estado activo, mostrar siempre el estado/respuesta
          if (estancia.renovacion_estado) {
            let contenido: React.ReactNode = null;
            if (estancia.renovacion_estado === 'SALIDA_CONFIRMADA') {
              contenido = (
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#15803D', background: '#F0FDF4', padding: '10px 14px', borderRadius: 8 }}>
                  ✓ Hemos recibido tu confirmación de salida. Nos pondremos en contacto contigo.
                </p>
              );
            } else if (estancia.renovacion_estado === 'PRORROGA_SOLICITADA') {
              if (estancia.renovacion_respuesta === 'APROBADA') {
                contenido = (
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#15803D', background: '#F0FDF4', padding: '10px 14px', borderRadius: 8 }}>
                    ✅ Prórroga aprobada. Te enviaremos el nuevo contrato para firmar en breve.
                  </p>
                );
              } else if (estancia.renovacion_respuesta === 'CONTRATO_FIRMADO') {
                contenido = (
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#15803D', background: '#F0FDF4', padding: '10px 14px', borderRadius: 8 }}>
                    ✅ Tu nuevo contrato está listo, con fecha de fin <strong>{new Date(estancia.fecha_salida_prevista).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</strong>. Puedes verlo en la sección &apos;Mis documentos&apos;.
                  </p>
                );
              } else if (estancia.renovacion_respuesta === 'DENEGADA') {
                contenido = (
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#991B1B', background: '#FEF2F2', padding: '10px 14px', borderRadius: 8 }}>
                    ❌ No ha sido posible esta vez.{estancia.renovacion_respuesta_motivo ? ' ' + estancia.renovacion_respuesta_motivo : ''}
                  </p>
                );
              } else {
                // Sin respuesta aún
                contenido = (
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#92400E', background: '#FFFBEB', padding: '10px 14px', borderRadius: 8 }}>
                    ⏳ Solicitud enviada{estancia.renovacion_fecha_solicitada ? ` (hasta ${new Date(estancia.renovacion_fecha_solicitada).toLocaleDateString('es-ES')})` : ''}. Te avisaremos cuando la revisemos.
                  </p>
                );
              }
            }
            if (!contenido) return null;
            return (
              <div style={{ background: '#FFFBEB', border: '1.5px solid #FCD34D', borderRadius: 14, padding: '18px 20px', marginBottom: 14 }}>
                <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 700, color: '#92400E' }}>📅 Estado de tu contrato</p>
                {contenido}
              </div>
            );
          }

          // Sin renovacion_estado: mostrar banner de acción solo si la salida está dentro de 60 días
          const hoy = new Date(); hoy.setHours(0,0,0,0);
          const salida = new Date(estancia.fecha_salida_prevista); salida.setHours(0,0,0,0);
          const diasRestantes = Math.ceil((salida.getTime() - hoy.getTime()) / 86400000);
          if (diasRestantes < 0 || diasRestantes > 60) return null;

          // Máximo meses = meses completos entre fecha_salida y (fecha_entrada + 11 meses)
          const entrada = new Date(estancia.fecha_entrada);
          const limite = new Date(entrada); limite.setMonth(limite.getMonth() + 11);
          const maxMeses = Math.floor((limite.getTime() - salida.getTime()) / (30.44 * 86400000));

          return (
            <div style={{ background: '#FFFBEB', border: '1.5px solid #FCD34D', borderRadius: 14, padding: '18px 20px', marginBottom: 14 }}>
              <p style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: '#92400E' }}>
                📅 Tu contrato finaliza el{' '}
                <strong>{salida.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</strong>.
                ¿Qué quieres hacer?
              </p>

              {renovacionEnviada ? (
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#15803D', background: '#F0FDF4', padding: '10px 14px', borderRadius: 8 }}>
                  ⏳ Solicitud enviada{renovacionFechaSolicitada ? ` (hasta ${new Date(renovacionFechaSolicitada).toLocaleDateString('es-ES')})` : ''}. Te avisaremos cuando la revisemos.
                </p>
              ) : mostrarFormProrroga ? (
                <div style={{ background: '#FFF', border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 16px', marginBottom: 10 }}>
                  {maxMeses <= 0 ? (
                    <p style={{ margin: 0, fontSize: 13, color: C.red, fontWeight: 600 }}>
                      Ya has alcanzado el límite legal de estancia (11 meses) y no es posible solicitar prórroga.
                    </p>
                  ) : (
                    <>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: C.gray700, marginBottom: 8 }}>
                        ¿Cuántos meses más necesitas?
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={maxMeses}
                        value={mesesSolicitados}
                        onChange={e => setMesesSolicitados(Math.min(maxMeses, Math.max(1, Number(e.target.value))))}
                        style={{ width: 80, padding: '8px 10px', border: `2px solid ${C.border}`, borderRadius: 8, fontSize: 15, fontFamily: FONT, outline: 'none', marginBottom: 8 }}
                      />
                      <p style={{ margin: '0 0 12px', fontSize: 12, color: C.gray500 }}>
                        Puedes solicitar hasta <strong>{maxMeses} mes{maxMeses !== 1 ? 'es' : ''}</strong> (límite legal: {limite.toLocaleDateString('es-ES')})
                      </p>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={handleSolicitarProrroga}
                          disabled={renovacionGuardando}
                          style={{ padding: '9px 16px', background: C.primary, color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: renovacionGuardando ? 'not-allowed' : 'pointer', fontFamily: FONT }}
                        >{renovacionGuardando ? 'Enviando…' : 'Confirmar solicitud'}</button>
                        <button
                          onClick={() => setMostrarFormProrroga(false)}
                          style={{ padding: '9px 14px', background: 'white', color: C.gray500, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: FONT }}
                        >Cancelar</button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button
                    onClick={() => { setMostrarFormProrroga(true); setMesesSolicitados(Math.max(1, Math.min(maxMeses, 1))); }}
                    style={{ padding: '10px 18px', background: C.primary, color: 'white', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}
                  >🔄 Solicitar prórroga</button>
                  <button
                    onClick={() => handleRenovacion('SALIDA_CONFIRMADA')}
                    disabled={renovacionGuardando}
                    style={{ padding: '10px 18px', background: 'white', color: '#92400E', border: '1.5px solid #FCD34D', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: renovacionGuardando ? 'not-allowed' : 'pointer', fontFamily: FONT }}
                  >📦 Confirmar salida</button>
                </div>
              )}
            </div>
          );
        })()}

        {/* ── Grid unificado 6 tarjetas ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 items-start">

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
            <div style={card}>
              <div style={{ ...cardHead }}>📖 Guía del piso</div>
              <div style={{ padding: '12px 20px' }}>
                {!wiki || visibles.length === 0 ? (
                  <p style={{ margin: 0, fontSize: '13px', color: C.gray400 }}>
                    La guía del piso aún no está disponible.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
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
        <div style={{ ...card, marginBottom: 0 }}>
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
        <div style={{ ...card, marginBottom: 0 }}>
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

        {/* ── Fianza ── */}
        {estancia.fianza != null && (
          <div style={{ ...card, marginBottom: 0 }}>
            <div style={cardHead}>🔐 Fianza</div>
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <p style={label}>Importe</p>
                <p style={{ ...value, color: C.primary }}>{estancia.fianza}€</p>
              </div>
              <div>
                <p style={label}>Estado</p>
                {estancia.fianza_devuelta === true ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', background: '#D1FAE5', color: C.green, fontSize: 12, fontWeight: 700, borderRadius: 20 }}>
                    ✓ Devuelta{estancia.fianza_devuelta_fecha ? ' · ' + new Date(estancia.fianza_devuelta_fecha).toLocaleDateString('es-ES') : ''}
                  </span>
                ) : estancia.checkout_completado ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', background: '#FEF3C7', color: '#B45309', fontSize: 12, fontWeight: 700, borderRadius: 20 }}>
                    ⏳ Pendiente de devolución
                  </span>
                ) : (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', background: '#EFF6FF', color: C.primary, fontSize: 12, fontWeight: 700, borderRadius: 20 }}>
                    🔒 En garantía
                  </span>
                )}
              </div>
              {estancia.fianza_retencion_motivo && (
                <div style={{ padding: '10px 12px', background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 8 }}>
                  <p style={{ margin: 0, fontSize: 12, color: '#92400E' }}>
                    <strong>Nota:</strong> {estancia.fianza_retencion_motivo}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Mis incidencias + formulario ── */}
        <div style={{ ...card, marginBottom: 0 }}>
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

                <div style={{ marginBottom: '16px' }}>
                  <label style={label}>Foto o vídeo del problema *</label>
                  <label style={{
                    display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer',
                    padding: '10px 14px', border: `2px dashed ${incArchivo ? C.green : C.border}`,
                    borderRadius: '8px', background: incArchivo ? '#F0FDF4' : C.gray50,
                    fontSize: '13px', color: incArchivo ? '#15803D' : C.gray500,
                  }}>
                    <span style={{ fontSize: '20px' }}>{incArchivo ? '✅' : '📎'}</span>
                    <span>{incArchivo ? incArchivo.name : 'Toca para adjuntar foto o vídeo'}</span>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      style={{ display: 'none' }}
                      onChange={(e) => setIncArchivo(e.target.files?.[0] ?? null)}
                    />
                  </label>
                </div>

                {incError && (
                  <p style={{ color: C.red, fontSize: '13px', marginBottom: '12px', padding: '10px 12px', background: '#FEF2F2', borderRadius: '8px' }}>
                    {incError}
                  </p>
                )}

                <button
                  onClick={handleReportarIncidencia}
                  disabled={incEnviando || incSubiendo}
                  style={{ width: '100%', padding: '13px', background: (incEnviando || incSubiendo) ? '#93AADA' : `linear-gradient(135deg, ${C.primary}, ${C.secondary})`, color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: (incEnviando || incSubiendo) ? 'not-allowed' : 'pointer', fontFamily: FONT }}
                >
                  {incSubiendo ? 'Subiendo archivo…' : incEnviando ? 'Enviando…' : 'Enviar incidencia'}
                </button>
              </div>
            )}

            {/* Lista */}
            {incidencias.length === 0 ? (
              <p style={{ color: C.gray400, fontSize: '14px', margin: 0 }}>No hay incidencias registradas.</p>
            ) : (
              incidencias.map((inc, idx) => (
                <div key={inc.id} style={{ padding: '12px 0', borderBottom: idx < incidencias.length - 1 ? `1px solid ${C.gray100}` : 'none' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '4px' }}>
                    <p style={{ margin: 0, fontWeight: '700', fontSize: '14px', color: C.gray900, textTransform: 'capitalize' }}>{inc.tipo}</p>
                    <span style={{
                      display: 'inline-block',
                      alignSelf: 'flex-start',
                      padding: '2px 8px',
                      borderRadius: '20px',
                      fontSize: '10px',
                      fontWeight: '700',
                      background: (prioridadColor[inc.prioridad] || C.gray400) + '22',
                      color: prioridadColor[inc.prioridad] || C.gray400,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}>{inc.prioridad}</span>
                  </div>
                  <p style={{ margin: '0 0 4px', fontSize: '13px', color: C.gray500 }}>{inc.descripcion}</p>
                  <span style={{ fontSize: '11px', color: C.gray400 }}>{inc.estado} · {new Date(inc.fecha_reporte).toLocaleDateString('es-ES')}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── Mis documentos ── */}
        {(() => {
          const TIPOS: { tipo: string; label: string; icon: string }[] = [
            { tipo: 'dni',              label: 'DNI / NIE / Pasaporte',              icon: '🪪' },
            { tipo: 'contrato_trabajo', label: 'Contrato de trabajo / Matrícula',    icon: '📄' },
            { tipo: 'normas_firmadas',  label: 'Normas de convivencia firmadas',     icon: '✍️' },
          ];
          const contratoDoc = docsExistentes.find(d => d.tipo === 'contrato');
          return (
            <div style={{ ...card, marginBottom: 0 }}>
              <div style={cardHead}>📁 Mis documentos</div>
              <div style={{ padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                {TIPOS.map(({ tipo, label, icon }) => {
                  const existente = docsExistentes.find(d => d.tipo === tipo);
                  const subiendo = docSubiendo[tipo] ?? false;
                  const reemplazar = docReemplazar[tipo] ?? false;
                  const mostrarInput = !existente || reemplazar;
                  return (
                    <div key={tipo} style={{ padding: '12px 14px', border: `1px solid ${C.border}`, borderRadius: 10, background: existente && !reemplazar ? '#F0FDF4' : C.gray50 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: mostrarInput ? 10 : 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: C.gray900, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span>{icon}</span>{label}
                        </span>
                        {existente && !reemplazar && (
                          <button
                            onClick={() => setDocReemplazar(r => ({ ...r, [tipo]: true }))}
                            style={{ alignSelf: 'flex-start', fontSize: 11, fontWeight: 700, color: C.primary, background: '#EFF6FF', border: 'none', borderRadius: 6, padding: '3px 9px', cursor: 'pointer', fontFamily: FONT }}
                          >Reemplazar</button>
                        )}
                      </div>
                      {existente && !reemplazar ? (
                        <p style={{ margin: 0, fontSize: 12, color: '#15803D', fontWeight: 600 }}>
                          ✓ Subido el {new Date(existente.fecha).toLocaleDateString('es-ES')} · <span style={{ fontWeight: 400, color: C.gray500 }}>{existente.nombre}</span>
                        </p>
                      ) : (
                        <label style={{
                          display: 'flex', alignItems: 'center', gap: 10, cursor: subiendo ? 'not-allowed' : 'pointer',
                          padding: '9px 12px', border: `2px dashed ${C.border}`, borderRadius: 8,
                          background: C.white, fontSize: 13, color: subiendo ? C.gray400 : C.gray500,
                        }}>
                          <span style={{ fontSize: 18 }}>{subiendo ? '⏳' : '📎'}</span>
                          <span>{subiendo ? 'Subiendo...' : 'Toca para adjuntar (PDF o imagen)'}</span>
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            disabled={subiendo}
                            style={{ display: 'none' }}
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) handleSubirDocumento(tipo, f);
                            }}
                          />
                        </label>
                      )}
                      {docError[tipo] && (
                        <p style={{ margin: '8px 0 0', fontSize: 12, color: C.red, background: '#FEF2F2', padding: '7px 10px', borderRadius: 7 }}>
                          {docError[tipo]}
                        </p>
                      )}
                      {docExito[tipo] && (
                        <p style={{ margin: '8px 0 0', fontSize: 12, color: '#15803D', background: '#F0FDF4', padding: '7px 10px', borderRadius: 7, fontWeight: 600 }}>
                          ✓ Documento guardado
                        </p>
                      )}
                    </div>
                  );
                })}
                {contratoDoc && (
                  <div style={{ padding: '12px 14px', border: `1px solid ${C.border}`, borderRadius: 10, background: '#F0FDF4' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: C.gray900, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      <span>📃</span>Contrato de tu estancia
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                      <p style={{ margin: 0, fontSize: 12, color: '#15803D', fontWeight: 600 }}>
                        ✓ Disponible · <span style={{ fontWeight: 400, color: C.gray500 }}>{contratoDoc.nombre}</span> · {new Date(contratoDoc.fecha).toLocaleDateString('es-ES')}
                      </p>
                      <button
                        onClick={async () => {
                          const { data, error } = await sb.storage.from('documentos').createSignedUrl(contratoDoc.url, 60);
                          if (!error && data?.signedUrl) {
                            window.open(data.signedUrl, '_blank');
                          }
                        }}
                        style={{ fontSize: 12, fontWeight: 700, color: C.primary, background: '#EFF6FF', border: 'none', borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontFamily: FONT, whiteSpace: 'nowrap' }}
                      >Ver</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        </div>{/* fin grid unificado */}

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
