'use client';
import { useState, useMemo } from 'react';
import { C, card, cardHead, cardBody } from './tokens';

export default function SectionCalculadora() {
  const [habs, setHabs] = useState(5);
  const [precio, setPrecio] = useState(650);
  const [alquiler, setAlquiler] = useState(1600);
  const [ocupacion, setOcupacion] = useState(85);
  const [limpieza, setLimpieza] = useState(120);
  const [suministros, setSuministros] = useState(200);
  const [mantenimiento, setMantenimiento] = useState(80);
  const [gestion, setGestion] = useState(50);
  const [reforma, setReforma] = useState(3000);

  const calc = useMemo(() => {
    const ingresos = habs * precio * (ocupacion / 100);
    const gastosFijos = alquiler + limpieza + suministros + mantenimiento + gestion;
    const beneficio = ingresos - gastosFijos;
    const roi = reforma > 0 ? ((beneficio * 12) / reforma) * 100 : 0;
    const breakeven = beneficio > 0 ? reforma / beneficio : 0;
    return { ingresos, gastosFijos, beneficio, roi, breakeven };
  }, [habs, precio, alquiler, ocupacion, limpieza, suministros, mantenimiento, gestion, reforma]);

  const verdict = calc.beneficio > 400 ? { icon: '🚀', text: 'Muy rentable', color: C.g, bg: C.gl }
    : calc.beneficio > 100 ? { icon: '✅', text: 'Rentable', color: C.g, bg: C.gl }
    : calc.beneficio > 0 ? { icon: '⚠️', text: 'Ajustado', color: C.y, bg: C.yl }
    : { icon: '🚫', text: 'No rentable', color: C.r, bg: C.rl };

  const scenarios = [
    { name: 'Optimista', factor: 1.15, color: C.g },
    { name: 'Base', factor: 1, color: C.b },
    { name: 'Pesimista', factor: 0.85, color: C.r },
  ];

  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  const InputRow = ({ label, value, onChange, min, max, step = 1, prefix = '', suffix = '' }: {
    label: string; value: number; onChange: (v: number) => void;
    min: number; max: number; step?: number; prefix?: string; suffix?: string;
  }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${C.g1}` }}>
      <span style={{ fontSize: 13, color: C.g9, flex: 1 }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 12, color: C.g5, fontFamily: "'Fraunces', serif", fontWeight: 700, minWidth: 60, textAlign: 'right' }}>{prefix}{value}{suffix}</span>
        <input
          type="number" value={value}
          onChange={e => onChange(Number(e.target.value))}
          min={min} max={max} step={step}
          style={{ width: 70, padding: '4px 8px', borderRadius: 7, border: `1.5px solid ${C.bd}`, fontSize: 13, textAlign: 'right', outline: 'none', fontFamily: 'inherit' }}
        />
      </div>
    </div>
  );

  return (
    <div>
      <style>{`@media(max-width:700px){.calc-grid{grid-template-columns:1fr!important}}`}</style>
      <div className="calc-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        <div style={card}>
          <div style={cardHead}>🧮 Parámetros del cálculo</div>
          <div style={cardBody}>
            <InputRow label="Nº habitaciones" value={habs} onChange={setHabs} min={1} max={20} />
            <InputRow label="Precio por hab." value={precio} onChange={setPrecio} min={300} max={1500} suffix="€" />
            <InputRow label="Alquiler propietario" value={alquiler} onChange={setAlquiler} min={500} max={5000} suffix="€" />
            <div style={{ padding: '10px 0', borderBottom: `1px solid ${C.g1}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: C.g9 }}>Ocupación</span>
                <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, color: C.b }}>{ocupacion}%</span>
              </div>
              <input type="range" min={50} max={100} value={ocupacion} onChange={e => setOcupacion(Number(e.target.value))}
                style={{ width: '100%', accentColor: C.b }} />
            </div>
            <InputRow label="Limpieza/mes" value={limpieza} onChange={setLimpieza} min={0} max={1000} suffix="€" />
            <InputRow label="Suministros/mes" value={suministros} onChange={setSuministros} min={0} max={1000} suffix="€" />
            <InputRow label="Mantenimiento/mes" value={mantenimiento} onChange={setMantenimiento} min={0} max={500} suffix="€" />
            <InputRow label="Gestión/mes" value={gestion} onChange={setGestion} min={0} max={500} suffix="€" />
            <InputRow label="Inversión reforma" value={reforma} onChange={setReforma} min={0} max={50000} step={100} suffix="€" />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ ...card, marginBottom: 0, background: verdict.bg, border: `1.5px solid ${verdict.color}` }}>
              <div style={{ padding: '16px' }}>
                <div style={{ fontSize: 11, color: verdict.color, fontWeight: 700, marginBottom: 4 }}>BENEFICIO NETO/MES</div>
                <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 30, color: calc.beneficio >= 0 ? C.g : C.r }}>
                  {calc.beneficio >= 0 ? '+' : ''}{Math.round(calc.beneficio)}€
                </div>
                <div style={{ fontSize: 11, color: C.g5, marginTop: 4 }}>= {Math.round(calc.beneficio * 12)}€/año</div>
              </div>
            </div>
            <div style={{ ...card, marginBottom: 0, background: C.bl, border: `1.5px solid ${C.b}` }}>
              <div style={{ padding: '16px' }}>
                <div style={{ fontSize: 11, color: C.b, fontWeight: 700, marginBottom: 4 }}>ROI ANUAL</div>
                <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 30, color: C.b }}>
                  {reforma > 0 ? `${calc.roi.toFixed(1)}%` : '∞'}
                </div>
                <div style={{ fontSize: 11, color: C.g5, marginTop: 4 }}>Breakeven: {calc.breakeven > 0 ? `${calc.breakeven.toFixed(1)} meses` : '—'}</div>
              </div>
            </div>
          </div>

          <div style={card}>
            <div style={cardHead}>📊 Desglose mensual</div>
            <div style={cardBody}>
              {[
                { label: 'Ingresos brutos', val: Math.round(calc.ingresos), color: C.g },
                { label: 'Alquiler propietario', val: -alquiler, color: C.r },
                { label: 'Gastos operativos', val: -(limpieza + suministros + mantenimiento + gestion), color: C.y },
                { label: 'Beneficio neto', val: Math.round(calc.beneficio), color: calc.beneficio >= 0 ? C.g : C.r, bold: true },
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: i < 3 ? `1px solid ${C.g1}` : 'none', fontSize: 13 }}>
                  <span style={{ color: C.g9, fontWeight: row.bold ? 700 : 500 }}>{row.label}</span>
                  <span style={{ color: row.color, fontFamily: "'Fraunces', serif", fontWeight: 700 }}>{row.val >= 0 ? '+' : ''}{row.val}€</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ ...card, background: verdict.bg, border: `1.5px solid ${verdict.color}`, marginBottom: 0 }}>
            <div style={{ padding: '14px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 4 }}>{verdict.icon}</div>
              <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 20, color: verdict.color }}>{verdict.text}</div>
              <div style={{ fontSize: 12, color: C.g5, marginTop: 4 }}>con {habs} habs a {ocupacion}% ocupación</div>
            </div>
          </div>
        </div>
      </div>

      <div className="calc-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div style={card}>
          <div style={cardHead}>📈 Proyección 12 meses</div>
          <div style={{ padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 80 }}>
              {months.map((m, i) => {
                const h = Math.max(4, ((calc.beneficio > 0 ? 1 : 0) * 70) + (Math.random() * 10 - 5));
                return (
                  <div key={m} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                    <div style={{ width: '100%', background: calc.beneficio >= 0 ? C.g : C.r, borderRadius: '3px 3px 0 0', height: `${h}px`, opacity: 0.7 + (i / months.length) * 0.3 }} />
                    <span style={{ fontSize: 8, color: C.g5 }}>{m}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div style={card}>
          <div style={cardHead}>🎯 Escenarios</div>
          <div style={cardBody}>
            {scenarios.map((s, i) => {
              const ben = Math.round(calc.beneficio * s.factor);
              const anual = ben * 12;
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < 2 ? `1px solid ${C.g1}` : 'none' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: C.g9 }}>{s.name}</div>
                    <div style={{ fontSize: 11, color: C.g5 }}>Ocupación {Math.round(ocupacion * s.factor)}%</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 18, color: s.color }}>{ben >= 0 ? '+' : ''}{ben}€/mes</div>
                    <div style={{ fontSize: 11, color: C.g5 }}>{anual >= 0 ? '+' : ''}{anual}€/año</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
