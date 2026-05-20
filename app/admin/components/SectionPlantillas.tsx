'use client';
import { useState } from 'react';
import { C, card } from './tokens';

type Categoria = 'todos' | 'captacion' | 'inquilinos' | 'operativa';

interface Plantilla {
  codigo: string;
  asunto: string;
  preview: string;
  categoria: Exclude<Categoria, 'todos'>;
  canal: 'email' | 'whatsapp';
}

const PLANTILLAS: Plantilla[] = [
  { codigo: 'WEL_02', asunto: 'Bienvenida al piso', preview: 'Hola [nombre], bienvenido a tu nuevo hogar en [piso]. Aquí te enviamos toda la información...', categoria: 'inquilinos', canal: 'email' },
  { codigo: 'SOL_03', asunto: 'Solicitud recibida', preview: 'Gracias por tu interés en [piso]. Hemos recibido tu solicitud y te contactamos en 24h...', categoria: 'captacion', canal: 'email' },
  { codigo: 'PRO_05', asunto: 'Propuesta habitación', preview: 'Te presentamos nuestra propuesta para [hab] en [piso]. Precio: [precio]€/mes...', categoria: 'captacion', canal: 'email' },
  { codigo: 'PIS_14', asunto: 'Info del piso', preview: 'Toda la información sobre tu nuevo piso: normas, WiFi, accesos y contactos...', categoria: 'captacion', canal: 'whatsapp' },
  { codigo: 'INF_06', asunto: 'Información adicional', preview: 'Adjuntamos información adicional sobre el proceso de alquiler y requisitos...', categoria: 'captacion', canal: 'email' },
  { codigo: 'CHK_10', asunto: 'Confirmación check-in', preview: 'Tu check-in está confirmado para el [fecha]. Nos vemos en [dirección] a las [hora]...', categoria: 'inquilinos', canal: 'whatsapp' },
  { codigo: 'CHK_11', asunto: 'Inventario check-in', preview: 'Adjunto el inventario de tu habitación. Por favor revísalo y firma en [enlace]...', categoria: 'inquilinos', canal: 'email' },
  { codigo: 'HUM_27', asunto: 'Bienvenida comunidad', preview: 'Hola a todos, os presentamos a [nombre] que se une al piso el [fecha]. ¡Bienvenido!', categoria: 'inquilinos', canal: 'whatsapp' },
  { codigo: 'MNT_15', asunto: 'Aviso mantenimiento', preview: 'El [fecha] vendrá [proveedor] para realizar el mantenimiento de [equipo]...', categoria: 'inquilinos', canal: 'whatsapp' },
  { codigo: 'MNT_16', asunto: 'Confirmación reparación', preview: 'Te confirmamos que la reparación de [avería] ha sido completada correctamente...', categoria: 'inquilinos', canal: 'email' },
  { codigo: 'INC_17', asunto: 'Incidencia registrada', preview: 'Hemos registrado tu incidencia #[codigo]. Nuestro equipo la atenderá en [sla]...', categoria: 'inquilinos', canal: 'email' },
  { codigo: 'INC_18', asunto: 'Incidencia resuelta', preview: 'Tu incidencia #[codigo] ha sido resuelta. ¿Puedes confirmarnos que todo está OK?...', categoria: 'inquilinos', canal: 'whatsapp' },
  { codigo: 'CIE_22', asunto: 'Aviso fin de contrato', preview: 'Tu contrato vence el [fecha]. Si deseas renovar, responde antes del [fecha-limite]...', categoria: 'inquilinos', canal: 'email' },
  { codigo: 'CIE_23', asunto: 'Confirmación salida', preview: 'Confirmamos tu check-out para el [fecha]. El proceso de devolución de fianza...', categoria: 'inquilinos', canal: 'email' },
  { codigo: 'FDB_24', asunto: 'Encuesta de satisfacción', preview: '¡Gracias por haber vivido con nosotros! Nos ayudaría mucho si completaras...', categoria: 'inquilinos', canal: 'email' },
  { codigo: 'HUM_28', asunto: 'Recordatorio normas', preview: 'Recordamos las normas de convivencia del piso: silencio 23-8h, cocina limpia...', categoria: 'operativa', canal: 'whatsapp' },
];

const FILTER_TABS: { key: Categoria; label: string; count: number }[] = [
  { key: 'todos', label: 'Todos', count: 36 },
  { key: 'captacion', label: 'Captación', count: 8 },
  { key: 'inquilinos', label: 'Inquilinos', count: 16 },
  { key: 'operativa', label: 'Operativa', count: 12 },
];

export default function SectionPlantillas() {
  const [filtro, setFiltro] = useState<Categoria>('todos');
  const [copied, setCopied] = useState<string | null>(null);

  const filtered = filtro === 'todos' ? PLANTILLAS : PLANTILLAS.filter(p => p.categoria === filtro);

  const handleCopy = (codigo: string, texto: string) => {
    void navigator.clipboard.writeText(texto);
    setCopied(codigo);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div>
      <style>{`
        @media(max-width:700px){.plant-grid{grid-template-columns:1fr!important}}
        .plant-card:hover .plant-copy{opacity:1!important}
      `}</style>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {FILTER_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setFiltro(tab.key)}
            style={{
              background: filtro === tab.key ? C.b : C.w,
              color: filtro === tab.key ? '#fff' : C.g9,
              border: `1.5px solid ${filtro === tab.key ? C.b : C.bd}`,
              borderRadius: 9, padding: '7px 14px', fontSize: 13, fontWeight: 700,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7,
            }}
          >
            {tab.label}
            <span style={{ background: filtro === tab.key ? 'rgba(255,255,255,.25)' : C.g1, color: filtro === tab.key ? '#fff' : C.g5, fontSize: 11, fontWeight: 700, padding: '1px 6px', borderRadius: 6 }}>{tab.count}</span>
          </button>
        ))}
      </div>

      <div className="plant-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {filtered.map(p => (
          <div key={p.codigo} className="plant-card" style={{ ...card, marginBottom: 0, position: 'relative' }}>
            <div style={{ padding: '12px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontFamily: 'monospace', fontSize: 11, background: C.bl, color: C.b, padding: '2px 7px', borderRadius: 5, fontWeight: 700 }}>{p.codigo}</span>
                <span style={{ fontSize: 13 }}>{p.canal === 'email' ? '📧' : '💬'}</span>
                <span style={{ background: p.categoria === 'captacion' ? C.bl : p.categoria === 'inquilinos' ? C.gl : C.yl, color: p.categoria === 'captacion' ? C.b : p.categoria === 'inquilinos' ? C.g : C.y, fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 6, marginLeft: 'auto' }}>{p.categoria}</span>
              </div>
              <div style={{ fontWeight: 700, fontSize: 13.5, color: C.g9, marginBottom: 4 }}>{p.asunto}</div>
              <div style={{ fontSize: 12, color: C.g5, lineHeight: 1.5, marginBottom: 8 }}>{p.preview}</div>
              <button
                className="plant-copy"
                onClick={() => handleCopy(p.codigo, p.preview)}
                style={{
                  opacity: 0, transition: 'opacity .2s',
                  background: copied === p.codigo ? C.g : C.b,
                  color: '#fff', border: 'none', borderRadius: 7, padding: '5px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                }}
              >
                {copied === p.codigo ? '✓ Copiado' : '📋 Copiar'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
