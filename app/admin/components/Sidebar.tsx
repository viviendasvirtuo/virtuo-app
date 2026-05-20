'use client';
import { C } from './tokens';

interface NavItem {
  key: string;
  label: string;
  icon: string;
  badge?: number | string;
  isNew?: boolean;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const groups: NavGroup[] = [
  {
    title: 'Principal',
    items: [
      { key: 'dashboard', label: 'Dashboard', icon: '📊' },
      { key: 'pisos', label: 'Mis Pisos', icon: '🏘️', badge: 3 },
      { key: 'ocupacion', label: 'Ocupación & KPIs', icon: '📈', isNew: true },
    ],
  },
  {
    title: 'Inquilinos',
    items: [
      { key: 'pipeline', label: 'Pipeline CRM', icon: '🎯', isNew: true },
      { key: 'matching', label: 'Matching G1-G10', icon: '🤝', isNew: true },
      { key: 'checkins', label: 'Check-ins / Outs', icon: '🔑' },
      { key: 'incidencias', label: 'Incidencias', icon: '⚠️', badge: 2 },
    ],
  },
  {
    title: 'Operativa',
    items: [
      { key: 'finanzas', label: 'Finanzas · P&L', icon: '💰' },
      { key: 'proveedores', label: 'Proveedores', icon: '🔧' },
      { key: 'comunidad', label: 'Comunidad', icon: '👥', isNew: true },
    ],
  },
  {
    title: 'Sistema',
    items: [
      { key: 'make', label: 'Make · A–E', icon: '⚡' },
      { key: 'calendly', label: 'Calendly', icon: '📅' },
      { key: 'registro', label: 'SOP16', icon: '📝', badge: 17 },
      { key: 'sops', label: 'SOPs 1–16', icon: '📖' },
      { key: 'plantillas', label: 'Plantillas', icon: '💬', badge: 36 },
    ],
  },
  {
    title: 'Herramientas',
    items: [
      { key: 'calculadora', label: 'Calculadora ROI', icon: '🧮' },
      { key: 'simulador', label: 'Simulador', icon: '🔄' },
    ],
  },
];

interface SidebarProps {
  active: string;
  onNavigate: (s: string) => void;
  menuOpen: boolean;
}

export default function Sidebar({ active, onNavigate, menuOpen }: SidebarProps) {
  return (
    <>
      <style>{`
        .admin-sidebar {
          position: fixed;
          width: 242px;
          background: #1E4DB7;
          height: 100vh;
          left: 0;
          top: 0;
          z-index: 100;
          overflow-y: auto;
          transition: transform .3s;
          display: flex;
          flex-direction: column;
        }
        @media (max-width: 900px) {
          .admin-sidebar { transform: translateX(-100%) !important; }
          .admin-sidebar.open { transform: translateX(0) !important; }
        }
        .sb-nav-item {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 8px 14px;
          border-radius: 9px;
          margin: 1px 8px;
          cursor: pointer;
          color: rgba(255,255,255,.82);
          font-size: 13px;
          font-weight: 500;
          transition: background .15s;
          user-select: none;
        }
        .sb-nav-item:hover { background: rgba(255,255,255,.1); }
        .sb-nav-item.active {
          background: #fff;
          color: #1E4DB7;
          font-weight: 700;
        }
      `}</style>
      <nav className={`admin-sidebar${menuOpen ? ' open' : ''}`}>
        {/* Logo */}
        <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid rgba(255,255,255,.15)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 22 }}>🏠</span>
            <div>
              <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, color: '#fff', fontSize: 15, lineHeight: 1.2 }}>
                Viviendas Virtuo
              </div>
              <div style={{ color: 'rgba(255,255,255,.6)', fontSize: 10.5, marginTop: 2 }}>
                v2.0 · R&R Property Mgmt
              </div>
            </div>
          </div>
        </div>

        {/* Nav Groups */}
        <div style={{ flex: 1, padding: '10px 0' }}>
          {groups.map((group) => (
            <div key={group.title} style={{ marginBottom: 8 }}>
              <div style={{
                padding: '6px 22px 3px',
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '.08em',
                color: 'rgba(255,255,255,.45)',
                textTransform: 'uppercase',
              }}>
                {group.title}
              </div>
              {group.items.map((item) => (
                <div
                  key={item.key}
                  className={`sb-nav-item${active === item.key ? ' active' : ''}`}
                  onClick={() => onNavigate(item.key)}
                >
                  <span style={{ fontSize: 14 }}>{item.icon}</span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.isNew && (
                    <span style={{
                      background: '#27AE60',
                      color: '#fff',
                      fontSize: 9,
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: 8,
                      letterSpacing: '.04em',
                    }}>NEW</span>
                  )}
                  {item.badge !== undefined && (
                    <span style={{
                      background: active === item.key ? C.bl : 'rgba(255,255,255,.22)',
                      color: active === item.key ? C.b : '#fff',
                      fontSize: 10,
                      fontWeight: 700,
                      padding: '2px 7px',
                      borderRadius: 10,
                      minWidth: 18,
                      textAlign: 'center',
                    }}>{item.badge}</span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* User block */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,.15)',
          padding: '12px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <div style={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            background: '#fff',
            color: C.b,
            fontWeight: 800,
            fontSize: 13,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>RH</div>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 12.5 }}>Raúl del Hoyo</div>
            <div style={{ color: 'rgba(255,255,255,.55)', fontSize: 10.5 }}>contacto@viviendasvirtuo.com</div>
          </div>
        </div>
      </nav>
    </>
  );
}
