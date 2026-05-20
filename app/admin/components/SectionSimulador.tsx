'use client';
import { useState } from 'react';
import { C, card, cardHead, cardBody } from './tokens';

interface Step {
  num: number;
  badge: string;
  titulo: string;
  subtitulo: string;
  triggers: string[];
  mensajes: { tipo: 'email' | 'whatsapp'; codigo: string; asunto: string; desc: string }[];
  acciones: string[];
}

const STEPS: Step[] = [
  {
    num: 1, badge: 'SOP01-04', titulo: 'Formulario de captación', subtitulo: 'Lead entrante detectado por Make',
    triggers: ['Formulario web enviado', 'DM Instagram recibido', 'Email directo'],
    mensajes: [
      { tipo: 'email', codigo: 'SOL_03', asunto: 'Solicitud recibida', desc: 'Email automático confirmando recepción del formulario.' },
      { tipo: 'whatsapp', codigo: 'PIS_14', asunto: 'Info del piso', desc: 'WhatsApp con info básica del piso y próximos pasos.' },
    ],
    acciones: ['Crear lead en CRM', 'Verificar duplicados (SOP16)', 'Asignar a pipeline'],
  },
  {
    num: 2, badge: 'SOP02', titulo: 'Contacto y Calendly', subtitulo: 'Gestión de la visita con seguimiento automatizado',
    triggers: ['Lead nuevo en pipeline', 'No respuesta en 24h', 'No respuesta en 48h (máx 3)'],
    mensajes: [
      { tipo: 'email', codigo: 'PRO_05', asunto: 'Propuesta habitación', desc: 'Email con propuesta y enlace Calendly para agendar visita.' },
    ],
    acciones: ['Enviar enlace Calendly', 'Programar recordatorios (máx 3)', 'Bloquear si no responde'],
  },
  {
    num: 3, badge: 'SOP03', titulo: 'Visita técnica', subtitulo: 'Evaluación del candidato y del piso',
    triggers: ['Visita confirmada en Calendly', 'Día de la visita'],
    mensajes: [
      { tipo: 'whatsapp', codigo: 'CHK_10', asunto: 'Confirmación visita', desc: 'Recordatorio WhatsApp 24h antes con dirección y hora.' },
    ],
    acciones: ['Checklist visita técnica', 'Fotos del piso', 'Evaluación candidato (matching)'],
  },
  {
    num: 4, badge: 'SOP04+08', titulo: 'Propuesta y firma', subtitulo: 'Negociación, contrato y documentación',
    triggers: ['Visita exitosa', 'Candidato aprobado'],
    mensajes: [
      { tipo: 'email', codigo: 'INF_06', asunto: 'Información adicional', desc: 'Documentación necesaria y requisitos del contrato.' },
      { tipo: 'email', codigo: 'PRO_05', asunto: 'Propuesta definitiva', desc: 'Propuesta final con precio, condiciones y fecha de entrada.' },
    ],
    acciones: ['Enviar contrato DocuSign', 'Recibir fianza', 'Registrar en sistema'],
  },
  {
    num: 5, badge: 'SOP09', titulo: 'Check-in', subtitulo: 'Bienvenida y onboarding del inquilino',
    triggers: ['Contrato firmado', 'Día del check-in'],
    mensajes: [
      { tipo: 'email', codigo: 'WEL_02', asunto: 'Bienvenida al piso', desc: 'Email completo con info del piso, normas y contactos.' },
      { tipo: 'whatsapp', codigo: 'HUM_27', asunto: 'Presentación comunidad', desc: 'Mensaje al grupo del piso presentando al nuevo inquilino.' },
    ],
    acciones: ['Entrega de llaves', 'Fotos habitación', 'Inventario CHK_11', 'Alta WhatsApp piso'],
  },
  {
    num: 6, badge: 'SOP10-11', titulo: 'Mantenimiento', subtitulo: 'Gestión de incidencias y mantenimiento',
    triggers: ['Formulario incidencia', 'Mantenimiento programado', 'Inicio de mes'],
    mensajes: [
      { tipo: 'email', codigo: 'INC_17', asunto: 'Incidencia registrada', desc: 'Confirmación automática del registro de la incidencia.' },
      { tipo: 'whatsapp', codigo: 'MNT_15', asunto: 'Aviso mantenimiento', desc: 'Notificación al piso sobre visita de mantenimiento.' },
    ],
    acciones: ['Crear ticket incidencia', 'Asignar proveedor', 'Seguimiento SLA', 'Cierre y valoración'],
  },
  {
    num: 7, badge: 'SOP12', titulo: 'Check-out / Renovación', subtitulo: 'Cierre de contrato y feedback',
    triggers: ['30 días antes del fin de contrato', 'Solicitud de salida'],
    mensajes: [
      { tipo: 'email', codigo: 'CIE_22', asunto: 'Aviso fin contrato', desc: 'Recordatorio automático sobre próximo vencimiento.' },
      { tipo: 'email', codigo: 'CIE_23', asunto: 'Confirmación checkout', desc: 'Proceso de devolución de fianza y check-out.' },
      { tipo: 'email', codigo: 'FDB_24', asunto: 'Encuesta feedback', desc: 'Encuesta NPS tras la salida del inquilino.' },
    ],
    acciones: ['Inventario comparativo', 'Fotos check-out', 'Devolución fianza', 'Publicar habitación'],
  },
];

export default function SectionSimulador() {
  const [step, setStep] = useState(0);
  const current = STEPS[step];

  return (
    <div>
      <style>{`@media(max-width:700px){.sim-layout{grid-template-columns:1fr!important}}`}</style>
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: C.g5, fontWeight: 600 }}>Paso {step + 1} de {STEPS.length}</span>
        </div>
        <div style={{ height: 6, background: C.g1, borderRadius: 4 }}>
          <div style={{ height: '100%', width: `${((step + 1) / STEPS.length) * 100}%`, background: C.b, borderRadius: 4, transition: 'width .3s' }} />
        </div>
      </div>

      <div className="sim-layout" style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 16 }}>
        <div style={card}>
          <div style={cardHead}>📋 Pasos del flujo</div>
          <div style={{ padding: '8px 0' }}>
            {STEPS.map((s, i) => (
              <div
                key={i}
                onClick={() => setStep(i)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px',
                  cursor: 'pointer', background: i === step ? C.bl : 'transparent',
                  borderLeft: `3px solid ${i === step ? C.b : 'transparent'}`,
                  transition: 'background .15s',
                }}
              >
                <div style={{
                  width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                  background: i < step ? C.g : i === step ? C.b : C.g1,
                  color: i < step || i === step ? '#fff' : C.g5,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 10,
                }}>{i < step ? '✓' : i + 1}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: i === step ? C.b : C.g9, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.titulo}</div>
                  <div style={{ fontSize: 10, color: C.g5 }}>{s.badge}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={card}>
            <div style={{ padding: '14px 16px 10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: C.b, color: '#fff', fontWeight: 800, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{current.num}</div>
                <div>
                  <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 18, color: C.g9 }}>{current.titulo}</div>
                  <div style={{ fontSize: 12, color: C.g5 }}>{current.subtitulo}</div>
                </div>
                <span style={{ marginLeft: 'auto', background: C.bl, color: C.b, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 8 }}>{current.badge}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={card}>
              <div style={cardHead}>⚡ Triggers</div>
              <div style={cardBody}>
                {current.triggers.map((t, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, padding: '6px 0', borderBottom: i < current.triggers.length - 1 ? `1px solid ${C.g1}` : 'none', fontSize: 12.5, color: C.g9 }}>
                    <span style={{ color: C.b, flexShrink: 0 }}>▸</span>{t}
                  </div>
                ))}
              </div>
            </div>

            <div style={card}>
              <div style={cardHead}>✅ Acciones</div>
              <div style={cardBody}>
                {current.acciones.map((a, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, padding: '6px 0', borderBottom: i < current.acciones.length - 1 ? `1px solid ${C.g1}` : 'none', fontSize: 12.5, color: C.g9 }}>
                    <span style={{ color: C.g, flexShrink: 0 }}>✓</span>{a}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={card}>
            <div style={cardHead}>💬 Mensajes automatizados</div>
            <div style={cardBody}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {current.mensajes.map((m, i) => (
                  <div key={i} style={{ background: C.g0, borderRadius: 10, padding: '12px 14px', border: `1.5px solid ${C.bd}` }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 5 }}>
                      <span style={{ fontSize: 14 }}>{m.tipo === 'email' ? '📧' : '💬'}</span>
                      <span style={{ fontFamily: 'monospace', fontSize: 11, background: C.bl, color: C.b, padding: '2px 7px', borderRadius: 5, fontWeight: 700 }}>{m.codigo}</span>
                      <span style={{ fontWeight: 700, fontSize: 13, color: C.g9 }}>{m.asunto}</span>
                    </div>
                    <div style={{ fontSize: 12, color: C.g5 }}>{m.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
            <button
              onClick={() => setStep((s: number) => Math.max(0, s - 1))}
              disabled={step === 0}
              style={{ background: step === 0 ? C.g1 : C.w, color: step === 0 ? C.g5 : C.g9, border: `1.5px solid ${C.bd}`, borderRadius: 9, padding: '9px 20px', fontSize: 13, fontWeight: 700, cursor: step === 0 ? 'not-allowed' : 'pointer' }}
            >
              ← Anterior
            </button>
            <span style={{ fontSize: 12, color: C.g5, alignSelf: 'center' }}>Paso {step + 1} / {STEPS.length}</span>
            <button
              onClick={() => setStep((s: number) => Math.min(STEPS.length - 1, s + 1))}
              disabled={step === STEPS.length - 1}
              style={{ background: step === STEPS.length - 1 ? C.g1 : C.b, color: step === STEPS.length - 1 ? C.g5 : '#fff', border: 'none', borderRadius: 9, padding: '9px 20px', fontSize: 13, fontWeight: 700, cursor: step === STEPS.length - 1 ? 'not-allowed' : 'pointer' }}
            >
              Siguiente →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
