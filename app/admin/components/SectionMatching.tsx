'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { C, card, cardHead, cardBody } from './tokens';

interface PropNombre { nombre: string; }
interface UnidadLibre {
  id: string;
  nombre: string;
  propiedad_id: string | null;
  precio_actual: number | null;
  propiedades: PropNombre | null;
}

interface UnidadConProp { propiedad_id: string | null; }
interface InquilinoGrupo { nombre: string; }
interface EstanciaActiva {
  inquilino_id: string | null;
  unidades: UnidadConProp | null;
  inquilinos: InquilinoGrupo | null;
}

interface Candidato {
  id: string;
  nombre: string;
  apellidos: string | null;
  grupo: string | null;
  grupo_simplificado: string | null;
  score_inquilino: number | null;
  blacklist: boolean | null;
}

function scoreColor(s: number) {
  return s >= 80 ? C.g : s >= 60 ? C.y : C.r;
}

function grupoLabel(grupo: string | null): string {
  if (!grupo) return '—';
  const match = grupo.match(/^(G\d+)/);
  return match ? match[1] : grupo.slice(0, 10);
}

export default function SectionMatching() {
  const [unidades, setUnidades] = useState<UnidadLibre[]>([]);
  const [estancias, setEstancias] = useState<EstanciaActiva[]>([]);
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const sb = createClient();
        const [r1, r2, r3] = await Promise.all([
          sb.from('unidades').select('id, nombre, propiedad_id, precio_actual, propiedades(nombre)').eq('estado', 'LIBRE'),
          sb.from('estancias').select('inquilino_id, unidades(propiedad_id), inquilinos(nombre)').eq('estado', 'ACTIVA'),
          sb.from('inquilinos').select('id, nombre, apellidos, grupo, grupo_simplificado, score_inquilino, blacklist'),
        ]);
        console.log('DEBUG inquilinosActivos:', JSON.stringify(r2.data, null, 2));
        console.log('DEBUG unidadesLibres:', JSON.stringify(r1.data, null, 2));
        setUnidades((r1.data ?? []) as unknown as UnidadLibre[]);
        setEstancias((r2.data ?? []) as unknown as EstanciaActiva[]);
        setCandidatos((r3.data ?? []) as Candidato[]);
      } catch (e) {
        setError(String(e));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return (
    <div style={{ padding: 32, color: C.g5, textAlign: 'center' }}>Calculando compatibilidades…</div>
  );
  if (error) return (
    <div style={{ background: '#FEF2F2', border: '1.5px solid #EF4444', borderRadius: 10, padding: 16, color: '#EF4444' }}>
      ⚠️ Error: {error}
    </div>
  );

  // IDs de inquilinos con estancia activa
  const activosIds = new Set(estancias.map(e => e.inquilino_id).filter(Boolean) as string[]);

  // Candidatos disponibles (sin estancia activa, sin blacklist)
  const disponibles = candidatos.filter(c => !c.blacklist && !activosIds.has(c.id));

  // Grupo predominante por propiedad
  function grupoPredominante(propiedadId: string): string | null {
    const grupos = estancias
      .filter(e => e.unidades?.propiedad_id === propiedadId && e.inquilinos)
      .map(e => (e.inquilinos as unknown as { grupo_simplificado?: string | null })?.grupo_simplificado ?? null)
      .filter(Boolean) as string[];
    if (grupos.length === 0) return null;
    const freq: Record<string, number> = {};
    for (const g of grupos) freq[g] = (freq[g] ?? 0) + 1;
    return Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0];
  }

  // Score de compatibilidad
  function calcScore(candidato: Candidato, grupoPred: string | null): number {
    const base = (candidato.score_inquilino ?? 5) * 10;
    const bonus = grupoPred === null ? 10 : candidato.grupo_simplificado === grupoPred ? 20 : 0;
    return Math.min(100, base + bonus);
  }

  return (
    <div>
      <style>{`@media(max-width:700px){.match-grid{grid-template-columns:1fr!important}}`}</style>

      {unidades.length === 0 && (
        <div style={{ ...card, textAlign: 'center', padding: 32, color: C.g5, fontSize: 14 }}>
          ✅ No hay unidades libres en este momento
        </div>
      )}

      <div className="match-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {unidades.map(u => {
          const propId = u.propiedad_id ?? '';
          const grupoPred = propId ? grupoPredominante(propId) : null;
          const pisoNombre = u.propiedades?.nombre ?? propId;

          const ranked = disponibles
            .map(c => ({ c, score: calcScore(c, grupoPred) }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 3);

          return (
            <div key={u.id} style={card}>
              <div style={cardHead}>
                🏠 {pisoNombre} · {u.nombre}
                {u.precio_actual && (
                  <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 600, color: C.b, background: '#EEF2FF', borderRadius: 6, padding: '2px 8px' }}>
                    {u.precio_actual}€/mes
                  </span>
                )}
              </div>
              <div style={cardBody}>
                <div style={{ fontSize: 11, color: C.g5, marginBottom: 12, fontWeight: 600 }}>
                  {grupoPred
                    ? <>Perfil predominante: <span style={{ color: C.b }}>{grupoPred}</span></>
                    : <span style={{ color: C.g }}>Piso vacío — cualquier perfil</span>
                  }
                </div>

                {ranked.length === 0 ? (
                  <div style={{ fontSize: 13, color: C.g5, textAlign: 'center', padding: '8px 0' }}>No hay candidatos disponibles</div>
                ) : (
                  ranked.map(({ c, score }, i) => (
                    <div key={c.id} style={{ marginBottom: i < ranked.length - 1 ? 14 : 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <div>
                          <span style={{ fontWeight: 700, fontSize: 13, color: C.g9 }}>
                            {c.nombre}{c.apellidos ? ' ' + c.apellidos : ''}
                          </span>
                          {c.grupo && (
                            <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 700, background: '#F0F4FF', color: '#1E4DB7', borderRadius: 6, padding: '2px 6px' }}>
                              {grupoLabel(c.grupo)}
                            </span>
                          )}
                        </div>
                        <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 17, color: scoreColor(score) }}>
                          {score}%
                        </span>
                      </div>
                      {c.grupo && (
                        <div style={{ fontSize: 11, color: C.g5, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {c.grupo}
                        </div>
                      )}
                      <div style={{ height: 5, background: C.g1, borderRadius: 3 }}>
                        <div style={{ height: '100%', width: `${score}%`, background: scoreColor(score), borderRadius: 3, transition: 'width .4s' }} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
