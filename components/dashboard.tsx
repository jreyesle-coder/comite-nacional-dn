"use client";

import { useMemo, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { CANDIDATOS, SIN_DEFINIR_HEX } from "@/lib/candidatos";
import { Dirigente } from "@/components/client-tabs";

interface Props {
  los32: Dirigente[];
  los172: Dirigente[];
}

export default function Dashboard({ los32, los172 }: Props) {
  const [grupo, setGrupo] = useState<"32" | "172">("32");
  const rows = grupo === "32" ? los32 : los172;

  const breakdown = useMemo(() => {
    const counts = new Map<string, number>();
    let sinDefinir = 0;
    for (const r of rows) {
      if (r.preferencia) {
        counts.set(r.preferencia, (counts.get(r.preferencia) ?? 0) + 1);
      } else {
        sinDefinir++;
      }
    }
    const items: { codigo: string; nombre: string; color: string; cantidad: number }[] =
      CANDIDATOS.map((c) => ({
        codigo: c.codigo,
        nombre: c.nombre,
        color: c.hex,
        cantidad: counts.get(c.codigo) ?? 0,
      }));
    items.push({ codigo: "SD", nombre: "Sin definir", color: SIN_DEFINIR_HEX, cantidad: sinDefinir });
    return items;
  }, [rows]);

  const total = rows.length;
  const data = breakdown.filter((b) => b.cantidad > 0);

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <span className="text-xs font-medium text-neutral-500">Ver grupo:</span>
        <div className="inline-flex rounded-full border border-prm-300 bg-white p-0.5">
          <button
            onClick={() => setGrupo("32")}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              grupo === "32" ? "bg-prm-700 text-white" : "text-prm-700 hover:bg-prm-50"
            }`}
          >
            32 miembros
          </button>
          <button
            onClick={() => setGrupo("172")}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              grupo === "172" ? "bg-prm-700 text-white" : "text-prm-700 hover:bg-prm-50"
            }`}
          >
            172 miembros
          </button>
        </div>
      </div>

      <div className="rounded-md border border-prm-200 bg-white p-4">
        <h2 className="mb-4 text-sm font-semibold text-neutral-700">
          Preferencia presidencial &mdash; Comité de los {grupo} ({total} dirigentes)
        </h2>
        {total === 0 ? (
          <p className="py-12 text-center text-neutral-400">Sin datos</p>
        ) : (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="cantidad"
                  nameKey="nombre"
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  label={(entry) => `${(entry as unknown as { cantidad: number }).cantidad}`}
                >
                  {data.map((entry) => (
                    <Cell key={entry.codigo} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="mt-6 divide-y divide-neutral-100 border-t border-neutral-100">
          {breakdown.map((b) => {
            const pct = total > 0 ? Math.round((b.cantidad / total) * 100) : 0;
            return (
              <div key={b.codigo} className="flex items-center gap-3 py-2 text-sm">
                <span
                  className="h-3 w-3 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: b.color }}
                />
                <span className="flex-1 text-neutral-700">{b.nombre}</span>
                <span className="text-neutral-500">{pct}%</span>
                <span className="w-10 text-right font-medium text-neutral-900">{b.cantidad}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
