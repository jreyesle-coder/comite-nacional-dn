"use client";

import { useMemo, useState, useTransition } from "react";
import { CANDIDATOS, candidatoPorCodigo } from "@/lib/candidatos";
import { login, logout, updatePreferencia } from "@/app/actions";

export interface Dirigente {
  id: number;
  grupo: "32" | "172";
  numero_orden: number | null;
  cedula: string | null;
  nombre: string;
  cargo: string | null;
  ubicacion: string | null;
  preferencia: string | null;
}

interface Props {
  los32: Dirigente[];
  los172: Dirigente[];
  initialAuthed: boolean;
}

type PendingChange = { id: number; preferencia: string | null };

export default function ClientTabs({ los32, los172, initialAuthed }: Props) {
  const [tab, setTab] = useState<"32" | "172">("32");
  const [rows32, setRows32] = useState(los32);
  const [rows172, setRows172] = useState(los172);
  const [authed, setAuthed] = useState(initialAuthed);
  const [pending, setPending] = useState<PendingChange | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const rows = tab === "32" ? rows32 : rows172;
  const setRows = tab === "32" ? setRows32 : setRows172;

  function applyLocal(id: number, preferencia: string | null) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, preferencia } : r)));
  }

  function requestChange(id: number, preferencia: string | null) {
    if (!authed) {
      setPending({ id, preferencia });
      setPasswordError(null);
      return;
    }
    applyLocal(id, preferencia);
    startTransition(async () => {
      const res = await updatePreferencia(id, preferencia);
      if (!res.ok) {
        applyLocal(id, rows.find((r) => r.id === id)?.preferencia ?? null);
        setPasswordError(res.error ?? "No se pudo guardar el cambio");
      }
    });
  }

  async function handleLogin(password: string) {
    const res = await login(password);
    if (!res.ok) {
      setPasswordError(res.error ?? "Contraseña incorrecta");
      return;
    }
    setAuthed(true);
    setPasswordError(null);
    if (pending) {
      const { id, preferencia } = pending;
      setPending(null);
      applyLocal(id, preferencia);
      startTransition(async () => {
        const r2 = await updatePreferencia(id, preferencia);
        if (!r2.ok) {
          setPasswordError(r2.error ?? "No se pudo guardar el cambio");
        }
      });
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-2">
          <TabButton active={tab === "32"} onClick={() => setTab("32")}>
            Comité de los 32 ({rows32.length})
          </TabButton>
          <TabButton active={tab === "172"} onClick={() => setTab("172")}>
            Comité de los 172 ({rows172.length})
          </TabButton>
        </div>
        {authed ? (
          <button
            onClick={() => {
              logout();
              setAuthed(false);
            }}
            className="text-xs text-neutral-500 underline hover:text-neutral-800"
          >
            Cerrar edición
          </button>
        ) : (
          <span className="text-xs text-neutral-400">Modo solo lectura</span>
        )}
      </div>

      <ComiteTabla rows={rows} onChange={requestChange} disabled={isPending} />

      {pending && (
        <PasswordModal
          error={passwordError}
          onCancel={() => {
            setPending(null);
            setPasswordError(null);
          }}
          onSubmit={handleLogin}
        />
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-prm-700 text-white"
          : "bg-prm-100 text-prm-700 hover:bg-prm-200"
      }`}
    >
      {children}
    </button>
  );
}

function ComiteTabla({
  rows,
  onChange,
  disabled,
}: {
  rows: Dirigente[];
  onChange: (id: number, preferencia: string | null) => void;
  disabled: boolean;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.nombre.toLowerCase().includes(q) ||
        (r.cargo ?? "").toLowerCase().includes(q) ||
        (r.ubicacion ?? "").toLowerCase().includes(q)
    );
  }, [rows, query]);

  const conteos = useMemo(() => {
    const map = new Map<string, number>();
    let sinDefinir = 0;
    for (const r of rows) {
      if (r.preferencia) {
        map.set(r.preferencia, (map.get(r.preferencia) ?? 0) + 1);
      } else {
        sinDefinir++;
      }
    }
    return { map, sinDefinir };
  }, [rows]);

  const showUbicacion = rows.some((r) => r.ubicacion);
  const showCedula = rows.some((r) => r.cedula);

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {CANDIDATOS.map((c) => (
          <span
            key={c.codigo}
            className={`rounded-full border px-3 py-1 text-xs font-medium ${c.color}`}
          >
            {c.nombre}: {conteos.map.get(c.codigo) ?? 0}
          </span>
        ))}
        <span className="rounded-full border border-neutral-300 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-600">
          Sin definir: {conteos.sinDefinir}
        </span>
      </div>

      <input
        type="text"
        placeholder="Buscar por nombre, cargo o ubicación..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mb-4 w-full max-w-md rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-prm-500 focus:outline-none focus:ring-1 focus:ring-prm-500"
      />

      <div className="overflow-x-auto rounded-md border border-prm-200">
        <table className="w-full text-sm">
          <thead className="bg-prm-50 text-left text-xs uppercase text-prm-700">
            <tr>
              <th className="px-3 py-2">#</th>
              <th className="px-3 py-2">Nombre</th>
              <th className="px-3 py-2">Cargo</th>
              {showCedula && <th className="px-3 py-2">Cédula</th>}
              {showUbicacion && <th className="min-w-[16rem] px-3 py-2">Ubicación</th>}
              <th className="px-3 py-2">Preferencia</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-t border-neutral-100 hover:bg-prm-50/40">
                <td className="px-3 py-2 text-neutral-400">{r.numero_orden}</td>
                <td className="px-3 py-2 font-medium text-neutral-900">{r.nombre}</td>
                <td className="px-3 py-2 text-neutral-600">{r.cargo}</td>
                {showCedula && <td className="px-3 py-2 text-neutral-500">{r.cedula}</td>}
                {showUbicacion && (
                  <td className="min-w-[16rem] whitespace-normal px-3 py-2 text-neutral-500">
                    {r.ubicacion}
                  </td>
                )}
                <td className="px-3 py-2">
                  <select
                    disabled={disabled}
                    value={r.preferencia ?? ""}
                    onChange={(e) => onChange(r.id, e.target.value || null)}
                    className={`rounded-md border px-2 py-1 text-xs font-medium ${
                      candidatoPorCodigo(r.preferencia)?.color ??
                      "border-neutral-300 bg-white text-neutral-500"
                    }`}
                  >
                    <option value="">Sin definir</option>
                    {CANDIDATOS.map((c) => (
                      <option key={c.codigo} value={c.codigo}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-neutral-400">
                  Sin resultados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PasswordModal({
  onSubmit,
  onCancel,
  error,
}: {
  onSubmit: (password: string) => void;
  onCancel: () => void;
  error: string | null;
}) {
  const [password, setPassword] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-neutral-900">
          Ingresa la contraseña para editar
        </h2>
        <p className="mt-1 text-sm text-neutral-500">
          La consulta es pública; marcar preferencia requiere la contraseña compartida.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(password);
          }}
          className="mt-4"
        >
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-prm-500 focus:outline-none focus:ring-1 focus:ring-prm-500"
            placeholder="Contraseña"
          />
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-md px-3 py-2 text-sm text-neutral-500 hover:bg-neutral-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-md bg-prm-700 px-4 py-2 text-sm font-medium text-white hover:bg-prm-800"
            >
              Entrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
