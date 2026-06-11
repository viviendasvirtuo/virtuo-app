'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Estancia {
  id: string;
  renta_mensual: number;
  fecha_entrada: string;
  fecha_salida_prevista: string;
  inquilinos: {
    nombre: string;
    apellidos: string;
    email: string;
  };
  unidades: {
    nombre: string;
    propiedades: {
      nombre: string;
      wifi_nombre: string;
      wifi_password: string;
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

export default function PortalPage() {
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [estancia, setEstancia] = useState<Estancia | null>(null);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [incidencias, setIncidencias] = useState<Incidencia[]>([]);

  const sb = createClient();

  async function handleLogin() {
    if (!codigo.trim()) return;
    setLoading(true);
    setError('');

    const { data: estanciaData, error: estanciaError } = await sb
      .from('estancias')
      .select('id, renta_mensual, fecha_entrada, fecha_salida_prevista, inquilinos(nombre, apellidos, email), unidades(nombre, propiedades(nombre, wifi_nombre, wifi_password))')
      .eq('unidad_id', codigo.trim().toUpperCase())
      .eq('estado', 'ACTIVA')
      .single();

    if (estanciaError || !estanciaData) {
      setError('Código de habitación no encontrado. Comprueba que es correcto.');
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
      .eq('unidad_id', codigo.trim().toUpperCase())
      .order('fecha_reporte', { ascending: false })
      .limit(5);

    setIncidencias((incidenciasData as Incidencia[]) || []);
    setLoading(false);
  }

  if (!estancia) {
    return (
      <main style={{ minHeight: '100vh', background: '#F0F4FF', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ background: 'white', borderRadius: '16px', padding: '40px', width: '100%', maxWidth: '420px', boxShadow: '0 4px 24px rgba(30,77,183,0.10)' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🏠</div>
            <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1E4DB7', margin: '0 0 8px' }}>Portal Inquilino</h1>
            <p style={{ color: '#6B7280', fontSize: '14px', margin: 0 }}>Viviendas Virtuo · R&R Property Mgmt</p>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              Código de habitación
            </label>
            <input
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="Ej: UNIT_SANTS_HAB1"
              style={{ width: '100%', padding: '12px 16px', border: '2px solid #E2E6EF', borderRadius: '10px', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          {error && (
            <p style={{ color: '#EF4444', fontSize: '13px', marginBottom: '16px', padding: '10px', background: '#FEF2F2', borderRadius: '8px' }}>
              {error}
            </p>
          )}
          <button
            onClick={handleLogin}
            disabled={loading}
            style={{ width: '100%', padding: '14px', background: '#1E4DB7', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}
          >
            {loading ? 'Buscando...' : 'Acceder →'}
          </button>
          <p style={{ textAlign: 'center', fontSize: '12px', color: '#9CA3AF', marginTop: '16px' }}>
            Tu código está en tu contrato o pregunta a tu gestor
          </p>
        </div>
      </main>
    );
  }

  const inq = estancia.inquilinos;
  const uni = estancia.unidades;
  const prop = estancia.unidades.propiedades;

  const estadoColor: Record<string, string> = {
    PAGADO: '#27AE60', PENDIENTE: '#F59E0B', VENCIDO: '#EF4444'
  };
  const prioridadColor: Record<string, string> = {
    alta: '#EF4444', media: '#F59E0B', baja: '#27AE60'
  };

  return (
    <main style={{ minHeight: '100vh', background: '#F0F4FF', padding: '24px' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ background: '#1E4DB7', borderRadius: '16px', padding: '24px', marginBottom: '20px', color: 'white' }}>
          <p style={{ margin: '0 0 4px', fontSize: '13px', opacity: 0.8 }}>Bienvenido/a</p>
          <h1 style={{ margin: '0 0 4px', fontSize: '22px', fontWeight: '700' }}>{inq.nombre} {inq.apellidos}</h1>
          <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>{prop.nombre} · {uni.nombre}</p>
        </div>

        {/* Info piso */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '20px', marginBottom: '16px' }}>
          <h2 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: '700', color: '#1E4DB7' }}>📋 Tu estancia</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div><p style={{ margin: '0 0 2px', fontSize: '11px', color: '#9CA3AF' }}>Renta mensual</p><p style={{ margin: 0, fontWeight: '700', color: '#111827' }}>{estancia.renta_mensual}€</p></div>
            <div><p style={{ margin: '0 0 2px', fontSize: '11px', color: '#9CA3AF' }}>Entrada</p><p style={{ margin: 0, fontWeight: '600', color: '#111827' }}>{new Date(estancia.fecha_entrada).toLocaleDateString('es-ES')}</p></div>
            <div><p style={{ margin: '0 0 2px', fontSize: '11px', color: '#9CA3AF' }}>Fin previsto</p><p style={{ margin: 0, fontWeight: '600', color: '#111827' }}>{new Date(estancia.fecha_salida_prevista).toLocaleDateString('es-ES')}</p></div>
            <div><p style={{ margin: '0 0 2px', fontSize: '11px', color: '#9CA3AF' }}>WiFi</p><p style={{ margin: 0, fontWeight: '600', color: '#111827' }}>{prop.wifi_nombre || '—'}</p></div>
          </div>
          {prop.wifi_password && <p style={{ margin: '12px 0 0', fontSize: '13px', color: '#6B7280' }}>Contraseña WiFi: <strong>{prop.wifi_password}</strong></p>}
        </div>

        {/* Pagos */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '20px', marginBottom: '16px' }}>
          <h2 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: '700', color: '#1E4DB7' }}>💰 Mis pagos</h2>
          {pagos.length === 0 ? (
            <p style={{ color: '#9CA3AF', fontSize: '14px' }}>No hay pagos registrados.</p>
          ) : (
            pagos.map((p) => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #F3F4F6' }}>
                <div>
                  <p style={{ margin: '0 0 2px', fontWeight: '600', fontSize: '14px', color: '#111827' }}>{p.mes_facturado}</p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#9CA3AF' }}>Vence: {new Date(p.fecha_vencimiento).toLocaleDateString('es-ES')}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: '0 0 2px', fontWeight: '700', fontSize: '15px' }}>{p.importe}€</p>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: estadoColor[p.estado] || '#6B7280' }}>{p.estado}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Incidencias */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '20px', marginBottom: '16px' }}>
          <h2 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: '700', color: '#1E4DB7' }}>🔧 Mis incidencias</h2>
          {incidencias.length === 0 ? (
            <p style={{ color: '#9CA3AF', fontSize: '14px' }}>No hay incidencias registradas.</p>
          ) : (
            incidencias.map((inc) => (
              <div key={inc.id} style={{ padding: '12px 0', borderBottom: '1px solid #F3F4F6' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <p style={{ margin: 0, fontWeight: '600', fontSize: '14px', color: '#111827', textTransform: 'capitalize' }}>{inc.tipo}</p>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: prioridadColor[inc.prioridad] || '#6B7280', textTransform: 'uppercase' }}>{inc.prioridad}</span>
                </div>
                <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#6B7280' }}>{inc.descripcion}</p>
                <span style={{ fontSize: '11px', color: '#9CA3AF' }}>{inc.estado} · {new Date(inc.fecha_reporte).toLocaleDateString('es-ES')}</span>
              </div>
            ))
          )}
        </div>

        <button
          onClick={() => { setEstancia(null); setCodigo(''); }}
          style={{ width: '100%', padding: '12px', background: 'white', color: '#6B7280', border: '2px solid #E2E6EF', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
        >
          Cerrar sesión
        </button>

      </div>
    </main>
  );
}
