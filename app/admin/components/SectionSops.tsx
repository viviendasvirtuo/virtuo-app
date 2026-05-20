import { C, card } from './tokens';

interface SopItem {
  num: string;
  titulo: string;
  desc: string;
}

interface SopGroup {
  nombre: string;
  color: string;
  bg: string;
  sops: SopItem[];
}

const GROUPS: SopGroup[] = [
  {
    nombre: 'Captación', color: C.b, bg: C.bl,
    sops: [
      { num: 'SOP01', titulo: 'Detección y registro', desc: 'Proceso de detección de leads entrantes y su registro en el sistema Make.' },
      { num: 'SOP02', titulo: 'Contacto propietario', desc: 'Protocolo de primer contacto con propietarios interesados en el modelo cohousing.' },
      { num: 'SOP03', titulo: 'Visita técnica', desc: 'Checklist para la visita técnica al inmueble: fotos, medidas y evaluación.' },
      { num: 'SOP04', titulo: 'Negociación y cierre', desc: 'Proceso de negociación de condiciones y cierre del acuerdo con propietario.' },
    ],
  },
  {
    nombre: 'Preparación', color: C.g, bg: C.gl,
    sops: [
      { num: 'SOP05', titulo: 'Preparación del piso', desc: 'Pautas para reformas, mobiliario y ambientación del piso antes de publicar.' },
      { num: 'SOP06', titulo: 'Publicación', desc: 'Proceso de publicación en plataformas: Idealista, web propia y redes sociales.' },
    ],
  },
  {
    nombre: 'Inquilinos', color: C.y, bg: C.yl,
    sops: [
      { num: 'SOP07', titulo: 'Filtrado', desc: 'Criterios de selección de candidatos: solvencia, compatibilidad y referencias.' },
      { num: 'SOP08', titulo: 'Contrato', desc: 'Elaboración, firma y gestión del contrato de arrendamiento por habitación.' },
      { num: 'SOP09', titulo: 'Check-in', desc: 'Protocolo de bienvenida: llaves, fotos, inventario y alta en WhatsApp del piso.' },
      { num: 'SOP10', titulo: 'Mantenimiento', desc: 'Gestión del mantenimiento preventivo y correctivo de las habitaciones.' },
      { num: 'SOP11', titulo: 'Incidencias', desc: 'Protocolo de gestión de incidencias: registro, prioridad, proveedor y seguimiento.' },
      { num: 'SOP12', titulo: 'Check-out', desc: 'Proceso de salida: inventario, fotos comparativas, fianza y feedback.' },
    ],
  },
  {
    nombre: 'Control', color: C.r, bg: C.rl,
    sops: [
      { num: 'SOP13', titulo: 'Control financiero', desc: 'Seguimiento mensual de ingresos, gastos y liquidación a propietarios.' },
      { num: 'SOP14', titulo: 'Proveedores', desc: 'Gestión, homologación y scoring de la red de proveedores del sistema.' },
      { num: 'SOP15', titulo: 'Indicadores', desc: 'Revisión periódica de KPIs: ocupación, NPS, churn y rentabilidad.' },
      { num: 'SOP16', titulo: 'Registro automatizado', desc: 'Sistema Make de detección y deduplicación de leads entrantes por todos los canales.' },
    ],
  },
];

export default function SectionSops() {
  return (
    <div>
      <style>{`
        @media(max-width:700px){.sop-cols{grid-template-columns:1fr!important}}
        @media(min-width:701px) and (max-width:1100px){.sop-cols{grid-template-columns:1fr 1fr!important}}
      `}</style>
      {GROUPS.map(group => (
        <div key={group.nombre} style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 4, height: 22, background: group.color, borderRadius: 2 }} />
            <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 16, color: C.g9 }}>{group.nombre}</span>
          </div>
          <div className="sop-cols" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            {group.sops.map(sop => (
              <div key={sop.num} style={{ ...card, marginBottom: 0 }}>
                <div style={{ height: 3, background: group.color }} />
                <div style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontFamily: 'monospace', fontSize: 11, background: group.bg, color: group.color, padding: '2px 7px', borderRadius: 5, fontWeight: 700 }}>{sop.num}</span>
                    <span style={{ background: C.gl, color: C.g, fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 6 }}>Activo</span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 13.5, color: C.g9, marginBottom: 5 }}>{sop.titulo}</div>
                  <div style={{ fontSize: 12, color: C.g5, lineHeight: 1.5 }}>{sop.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
