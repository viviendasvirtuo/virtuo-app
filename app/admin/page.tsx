"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Propiedad = {
  id: string;
  nombre: string;
  [key: string]: unknown;
};

export default function AdminPage() {
  const [propiedades, setPropiedades] = useState<Propiedad[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    supabase
      .from("propiedades")
      .select("*")
      .then(({ data, error }) => {
        if (error) {
          setError(`${error.code}: ${error.message}`);
        } else {
          setPropiedades(data ?? []);
        }
        setLoading(false);
      });
  }, []);

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard Admin</h1>

      {loading && <p className="text-gray-500">Cargando propiedades...</p>}

      {error && (
        <div className="bg-red-50 border border-red-300 rounded p-4 text-red-700 font-mono text-sm">
          <p className="font-bold mb-1">Error de conexión:</p>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && propiedades.length === 0 && (
        <p className="text-gray-500">No hay propiedades en la tabla.</p>
      )}

      {propiedades.length > 0 && (
        <ul className="space-y-2">
          {propiedades.map((p) => (
            <li
              key={p.id}
              className="border rounded p-3 bg-white shadow-sm text-gray-800"
            >
              {p.nombre ?? JSON.stringify(p)}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
