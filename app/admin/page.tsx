"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

// ─── Types ───────────────────────────────────────────────────────────────────

interface KPIData {
  totalPropiedades: number;
  totalUnidades: number;
  unidadesOcupadas: number;
  ocupacionPct: number;
}

interface Propiedad {
  id: string;
  nombre: string;
  barrio: string | null;
  estado: string | null;
  alquiler_propietario: number | null;
}

interface Alerta {
  id?: string;
  tipo: string | null;
  mensaje: string | null;
  prioridad: string | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function prioridadStyle(p: string | null) {
  if (p === "alta")  return { bg: "#FEF2F2", border: "#FCA5A5", text: "#DC2626" };
  if (p === "media") return { bg: "#FFF7ED", border: "#FDBA74", text: "#EA580C" };
  return                    { bg: "#F0FDF4", border: "#86EFAC", text: "#16A34A" };
}

function estadoStyle(e: string | null) {
  if (e === "ACTIVA")        return { bg: "#DCFCE7", text: "#16A34A" };
  if (e === "MANTENIMIENTO") return { bg: "#FFF7ED", text: "#EA580C" };
  return                            { bg: "#F1F5F9", text: "#64748B" };
}

function formatEuros(n: number | null) {
  if (n == null) return "—";
  return `€${Number(n).toLocaleString("es-ES")}` ;
}

// ─── Skeleton pieces ─────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl p-5 border border-[#E2E6EF] animate-pulse">
      <div className="h-3 bg-gray-200 rounded w-28 mb-3" />
      <div className="h-8 bg-gray-200 rounded w-16" />
    </div>
  );
}

function SkeletonTableRows() {
  return (
    <>
      {[0, 1, 2].map((i) => (
        <tr key={i} style={{ borderTop: i > 0 ? "1px solid #E2E6EF" : undefined }}>
          {[0, 1, 2, 3].map((j) => (
            <td key={j} className="px-4 py-3">
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

function SkeletonAlerts() {
  return (
    <div className="space-y-2">
      {[0, 1].map((i) => (
        <div key={i} className="h-16 bg-white rounded-xl border border-[#E2E6EF] animate-pulse" />
      ))}
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function KPICard({ label, value, accent }: { label: string; value: string | number; accent: string }) {
  return (
    <div className="bg-white rounded-xl p-4 md:p-5 border" style={{ borderColor: "#E2E6EF" }}>
      <p className="text-xs font-medium text-gray-500 mb-2 leading-tight">{label}</p>
      <p className="text-2xl md:text-3xl font-bold leading-none" style={{ color: accent }}>
        {value}
      </p>
    </div>
  );
}

function EstadoBadge({ estado }: { estado: string | null }) {
  const s = estadoStyle(estado);
  return (
    <span
      className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full"
      style={{ backgroundColor: s.bg, color: s.text }}
    >
      {estado ?? "—"}
    </span>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [kpis, setKpis]               = useState<KPIData | null>(null);
  const [propiedades, setPropiedades] = useState<Propiedad[]>([]);
  const [alertas, setAlertas]         = useState<Alerta[]>([]);
  const [loading, setLoading]         = useState(true);
  const [errorMsg, setErrorMsg]       = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    async function fetchAll() {
      try {
        const [
          { count: cProp,     error: err1 },
          { count: cUnid,     error: err2 },
          { count: cOcupadas, error: err3 },
          { data:  dProp,     error: err4 },
          { data:  dAlertas,  error: err5 },
        ] = await Promise.all([
          supabase.from("propiedades").select("*", { count: "exact", head: true }),
          supabase.from("unidades").select("*", { count: "exact", head: true }),
          supabase.from("unidades").select("*", { count: "exact", head: true }).eq("estado", "OCUPADA"),
          supabase.from("propiedades").select("id, nombre, barrio, estado, alquiler_propietario"),
          supabase.from("v_alertas").select("*"),
        ]);

        const firstError = err1 ?? err2 ?? err3 ?? err4 ?? err5;
        if (firstError) {
          setErrorMsg(`${firstError.code}: ${firstError.message}`);
          return;
        }

        const total    = cUnid     ?? 0;
        const ocupadas = cOcupadas ?? 0;

        setKpis({
          totalPropiedades: cProp ?? 0,
          totalUnidades:    total,
          unidadesOcupadas: ocupadas,
          ocupacionPct:     total > 0 ? Math.round((ocupadas / total) * 100) : 0,
        });
        setPropiedades((dProp  as Propiedad[]) ?? []);
        setAlertas    ((dAlertas as Alerta[])  ?? []);
      } catch (err) {
        setErrorMsg(String(err));
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
  }, []);

  const ocupPct = kpis?.ocupacionPct ?? 0;

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
      />

      <div
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", backgroundColor: "#F0F4FF", minHeight: "100vh" }}
      >
        {/* ── HEADER ── */}
        <header style={{ backgroundColor: "#1E4DB7" }} className="px-4 py-4 md:px-8">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div>
              <p className="text-white font-bold text-xl md:text-2xl tracking-tight">
                Viviendas Virtuo
              </p>
              <p className="text-blue-200 text-sm mt-0.5">Dashboard Admin</p>
            </div>
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0"
              style={{ backgroundColor: "#2E86DE" }}
            >
              VA
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-6 md:px-8 space-y-8">

          {/* ── ERROR GLOBAL ── */}
          {errorMsg && (
            <div className="bg-red-50 border border-red-300 rounded-xl p-4 text-red-700 font-mono text-sm">
              <p className="font-bold mb-1">Error al cargar datos:</p>
              <p>{errorMsg}</p>
            </div>
          )}

          {/* ── KPIs ── */}
          <section>
            <h2
              className="text-xs font-bold uppercase tracking-widest mb-3"
              style={{ color: "#1E4DB7" }}
            >
              Resumen global
            </h2>
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              {loading ? (
                <><SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard /></>
              ) : (
                <>
                  <KPICard label="Total propiedades"  value={kpis?.totalPropiedades  ?? 0} accent="#1E4DB7" />
                  <KPICard label="Total unidades"     value={kpis?.totalUnidades     ?? 0} accent="#2E86DE" />
                  <KPICard label="Unidades ocupadas"  value={kpis?.unidadesOcupadas  ?? 0} accent="#2E86DE" />
                  <KPICard
                    label="Ocupación"
                    value={`${ocupPct}%`}
                    accent={ocupPct >= 80 ? "#27AE60" : "#1E4DB7"}
                  />
                </>
              )}
            </div>
          </section>

          {/* ── TABLA PROPIEDADES ── */}
          <section>
            <h2
              className="text-xs font-bold uppercase tracking-widest mb-3"
              style={{ color: "#1E4DB7" }}
            >
              Propiedades
            </h2>
            <div
              className="bg-white rounded-xl border overflow-hidden"
              style={{ borderColor: "#E2E6EF" }}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ backgroundColor: "#F0F4FF" }}>
                      {["Nombre", "Barrio", "Estado", "Alquiler propietario"].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wider whitespace-nowrap"
                          style={{ color: "#1E4DB7" }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <SkeletonTableRows />
                    ) : propiedades.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-10 text-center text-gray-400 text-sm">
                          No hay propiedades registradas.
                        </td>
                      </tr>
                    ) : (
                      propiedades.map((p, i) => (
                        <tr
                          key={p.id}
                          style={{ borderTop: i > 0 ? "1px solid #E2E6EF" : undefined }}
                          className="hover:bg-blue-50 transition-colors duration-100"
                        >
                          <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">
                            {p.nombre}
                          </td>
                          <td className="px-4 py-3 text-gray-500">{p.barrio ?? "—"}</td>
                          <td className="px-4 py-3">
                            <EstadoBadge estado={p.estado} />
                          </td>
                          <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                            {formatEuros(p.alquiler_propietario)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* ── ALERTAS ── */}
          <section>
            <h2
              className="text-xs font-bold uppercase tracking-widest mb-3"
              style={{ color: "#1E4DB7" }}
            >
              Alertas activas
              {alertas.length > 0 && (
                <span
                  className="ml-2 inline-block text-xs font-bold px-2 py-0.5 rounded-full text-white"
                  style={{ backgroundColor: "#DC2626" }}
                >
                  {alertas.length}
                </span>
              )}
            </h2>

            {loading ? (
              <SkeletonAlerts />
            ) : alertas.length === 0 ? (
              <div
                className="bg-white rounded-xl border p-6 text-gray-400 text-sm text-center"
                style={{ borderColor: "#E2E6EF" }}
              >
                No hay alertas activas.
              </div>
            ) : (
              <div className="space-y-2">
                {alertas.map((a, i) => {
                  const s = prioridadStyle(a.prioridad);
                  return (
                    <div
                      key={a.id ?? i}
                      className="rounded-xl border p-4 flex items-start gap-3"
                      style={{ backgroundColor: s.bg, borderColor: s.border }}
                    >
                      <div
                        className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                        style={{ backgroundColor: s.text }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <span
                            className="text-xs font-bold uppercase tracking-wider"
                            style={{ color: s.text }}
                          >
                            {a.tipo ?? "Alerta"}
                          </span>
                          <span
                            className="text-xs font-semibold px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: s.border, color: s.text }}
                          >
                            {a.prioridad ?? "—"}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 break-words">
                          {a.mensaje ?? "Sin descripción"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

        </main>
      </div>
    </>
  );
}
