"use client";

import { useMemo, useState } from "react";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { CANDIDATOS, SIN_DEFINIR_HEX } from "@/lib/candidatos";
import { Dirigente } from "@/components/client-tabs";

interface Props {
  los32: Dirigente[];
  los172: Dirigente[];
}

export default function Dashboard({ los32, los172 }: Props) {
  const [grupo, setGrupo] = useState<"32" | "172">("32");
  const rows = grupo === "32" ? los32 : los172;

  const data = useMemo(() => {
    const counts = new Map<string, number>();
    let sinDefinir = 0;
    for (const r of rows) {
      if (r.preferencia) {
        counts.set(r.preferencia, (counts.get(r.preferencia) ?? 0) + 1);
      } else {
        sinDefinir++;
      }
    }
    const slices = CANDIDATOS.filter((c) => (counts.get(c.codigo) ?? 0) > 0).map((c) => ({
      name: c.nombre,
      value: counts.get(c.codigo) ?? 0,
      color: c.hex,
    }));
    if (sinDefinir > 0) {
      slices.push({ name: "Sin definir", value: sinDefinir, color: SIN_DEFINIR_HEX });
    }
    return slices;
  }, [rows]);

  const total = rows.length;

  return (
    <div>
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setGrupo("32")}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            grupo === "32" ? "bg-prm-700 text-white" : "bg-prm-100 text-prm-700 hover:bg-prm-200"
          }`}
        >
          Comité de los 32
        </button>
        <button
          onClick={() => setGrupo("172")}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            grupo === "172" ? "bg-prm-700 text-white" : "bg-prm-100 text-prm-700 hover:bg-prm-200"
          }`}
        >
          Comité de los 172
        </button>
      </div>

      <div className="rounded-md border border-prm-200 bg-white p-4">
        <h2 className="mb-4 text-sm font-semibold text-neutral-700">
          Preferencia presidencial &mdash; Comité de los {grupo} ({total} dirigentes)
        </h2>
        {total === 0 ? (
          <p className="py-12 text-center text-neutral-400">Sin datos</p>
        ) : (
          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={130}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                >
                  {data.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
