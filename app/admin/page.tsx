'use client';
import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import SectionDashboard from './components/SectionDashboard';
import SectionPisos from './components/SectionPisos';
import SectionOcupacion from './components/SectionOcupacion';
import SectionPipeline from './components/SectionPipeline';
import SectionMatching from './components/SectionMatching';
import SectionCheckins from './components/SectionCheckins';
import SectionIncidencias from './components/SectionIncidencias';
import SectionFinanzas from './components/SectionFinanzas';
import SectionProveedores from './components/SectionProveedores';
import SectionComunidad from './components/SectionComunidad';
import SectionMake from './components/SectionMake';
import SectionCalendly from './components/SectionCalendly';
import SectionRegistro from './components/SectionRegistro';
import SectionSops from './components/SectionSops';
import SectionPlantillas from './components/SectionPlantillas';
import SectionCalculadora from './components/SectionCalculadora';
import SectionSimulador from './components/SectionSimulador';

const sectionTitles: Record<string, string> = {
  dashboard: 'Dashboard',
  pisos: 'Mis Pisos',
  ocupacion: 'Ocupación & KPIs',
  pipeline: 'Pipeline CRM',
  matching: 'Matching G1-G10',
  checkins: 'Check-ins / Outs',
  incidencias: 'Incidencias',
  finanzas: 'Finanzas · P&L',
  proveedores: 'Proveedores',
  comunidad: 'Comunidad',
  make: 'Make · A–E',
  calendly: 'Calendly',
  registro: 'SOP16 · Registro',
  sops: 'SOPs 1–16',
  plantillas: 'Plantillas',
  calculadora: 'Calculadora ROI',
  simulador: 'Simulador',
};

function ActiveSection({ active }: { active: string }) {
  switch (active) {
    case 'dashboard': return <SectionDashboard />;
    case 'pisos': return <SectionPisos />;
    case 'ocupacion': return <SectionOcupacion />;
    case 'pipeline': return <SectionPipeline />;
    case 'matching': return <SectionMatching />;
    case 'checkins': return <SectionCheckins />;
    case 'incidencias': return <SectionIncidencias />;
    case 'finanzas': return <SectionFinanzas />;
    case 'proveedores': return <SectionProveedores />;
    case 'comunidad': return <SectionComunidad />;
    case 'make': return <SectionMake />;
    case 'calendly': return <SectionCalendly />;
    case 'registro': return <SectionRegistro />;
    case 'sops': return <SectionSops />;
    case 'plantillas': return <SectionPlantillas />;
    case 'calculadora': return <SectionCalculadora />;
    case 'simulador': return <SectionSimulador />;
    default: return <SectionDashboard />;
  }
}

export default function AdminPage() {
  const [active, setActive] = useState<string>('dashboard');
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  const handleNavigate = (s: string) => {
    setActive(s);
    setMenuOpen(false);
  };

  return (
    <>
      <style>{`
        @media (max-width: 900px) {
          .admin-main { margin-left: 0 !important; }
        }
        .admin-content { animation: fu .3s ease; }
        @keyframes fu {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: none; }
        }
      `}</style>

      {/* Overlay for mobile */}
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,.45)',
            zIndex: 90,
          }}
        />
      )}

      <Sidebar active={active} onNavigate={handleNavigate} menuOpen={menuOpen} />

      <div
        className="admin-main"
        style={{ marginLeft: 242, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}
      >
        <Topbar
          title={sectionTitles[active] ?? 'Admin'}
          onMenuToggle={() => setMenuOpen((v: boolean) => !v)}
        />
        <div style={{ padding: '20px 22px', flex: 1 }} className="admin-content" key={active}>
          <ActiveSection active={active} />
        </div>
      </div>
    </>
  );
}
