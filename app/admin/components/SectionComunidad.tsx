import { C, card, cardHead, cardBody } from './tokens';

const ANUNCIOS = [
  { tipo: 'warn', icon: '⚠️', titulo: 'Mantenimiento caldera', texto: 'El miércoles 22 de mayo habrá revisión de la caldera entre 10:00-12:00h. Posible corte de agua caliente.', fecha: 'Hace 1h', color: C.y, bg: C.yl },
  { tipo: 'info', icon: '📢', titulo: 'Normas limpieza cocina', texto: 'Recordamos que la cocina debe quedar limpia tras cada uso. Por favor limpiar fogones y fregadero. ¡Gracias!', fecha: 'Hace 2d', color: C.b, bg: C.bl },
  { tipo: 'ok', icon: '🎉', titulo: '¡Bienvenido Alejandro!', texto: 'Este fin de semana se une Alejandro Fernández al piso de Sants. Haremos una pequeña bienvenida el sábado a las 19h.', fecha: 'Hace 3d', color: C.g, bg: C.gl },
];

const TAREAS_COMUNIDAD = [
  { persona: 'Alejandro', avatar: 'AF', tarea: 'Limpieza baño compartido', dia: 'Lunes', color: C.b },
  { persona: 'María', avatar: 'MG', tarea: 'Compra productos limpieza', dia: 'Martes', color: C.p },
  { persona: 'Jorge', avatar: 'JM', tarea: 'Sacar basura reciclaje', dia: 'Miércoles', color: C.g },
  { persona: 'Sara', avatar: 'SL', tarea: 'Limpieza cocina', dia: 'Jueves', color: C.y },
];

const NORMAS = [
  '🔇 Silencio de 23:00 a 08:00h',
  '🍳 Cocina limpia tras cada uso',
  '🚿 Baños por rotación semanal',
  '🚪 Puertas cerradas con llave al salir',
  '🐾 Mascotas solo con permiso previo',
  '🎵 Música con auriculares pasada la medianoche',
];

export default function SectionComunidad() {
  return (
    <div>
      <style>{`@media(max-width:700px){.com-grid{grid-template-columns:1fr!important}}`}</style>
      <div className="com-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div>
          <div style={{ ...card }}>
            <div style={cardHead}>📢 Anuncios del piso</div>
            <div style={cardBody}>
              {ANUNCIOS.map((a, i) => (
                <div key={i} style={{ background: a.bg, border: `1.5px solid ${a.color}`, borderRadius: 10, padding: '12px 14px', marginBottom: i < ANUNCIOS.length - 1 ? 10 : 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                    <span style={{ fontSize: 16 }}>{a.icon}</span>
                    <span style={{ fontWeight: 700, fontSize: 13, color: C.g9 }}>{a.titulo}</span>
                    <span style={{ marginLeft: 'auto', fontSize: 10, color: C.g5 }}>{a.fecha}</span>
                  </div>
                  <div style={{ fontSize: 12.5, color: C.g9, lineHeight: 1.5 }}>{a.texto}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={card}>
            <div style={cardHead}>🧹 Tareas de comunidad</div>
            <div style={cardBody}>
              {TAREAS_COMUNIDAD.map((t, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < TAREAS_COMUNIDAD.length - 1 ? `1px solid ${C.g1}` : 'none' }}>
                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: t.color, color: '#fff', fontWeight: 700, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{t.avatar}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.g9 }}>{t.tarea}</div>
                    <div style={{ fontSize: 11, color: C.g5 }}>{t.persona} · {t.dia}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ ...card, marginBottom: 0 }}>
            <div style={cardHead}>📋 Normas de convivencia</div>
            <div style={cardBody}>
              {NORMAS.map((n, i) => (
                <div key={i} style={{ fontSize: 13, color: C.g9, padding: '6px 0', borderBottom: i < NORMAS.length - 1 ? `1px solid ${C.g1}` : 'none' }}>{n}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
