import { createClient } from "@/lib/supabase/server";
import { isAuthed } from "@/lib/auth";
import ClientTabs, { Dirigente } from "@/components/client-tabs";
import Logo from "@/components/logo";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("dirigentes")
    .select("id, grupo, numero_orden, cedula, nombre, cargo, ubicacion, preferencia")
    .order("numero_orden", { ascending: true });

  const authed = await isAuthed();

  if (error) {
    return (
      <main className="mx-auto max-w-3xl p-8">
        <h1 className="text-xl font-semibold text-red-700">Error cargando datos</h1>
        <p className="mt-2 text-sm text-red-600">{error.message}</p>
        <p className="mt-4 text-sm text-neutral-600">
          Verifica que la migración SQL se haya ejecutado en Supabase y que las
          variables de entorno estén configuradas.
        </p>
      </main>
    );
  }

  const dirigentes = (data ?? []) as Dirigente[];
  const los32 = dirigentes.filter((d) => d.grupo === "32");
  const los172 = dirigentes.filter((d) => d.grupo === "172");

  return (
    <div className="min-h-screen bg-prm-50">
      <header className="border-b-4 border-gold-400 bg-prm-700">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-5">
          <Logo />
          <div>
            <h1 className="text-2xl font-bold text-white">
              Comité Nacional PRM &mdash; Distrito Nacional
            </h1>
            <p className="mt-1 text-sm text-prm-100">
              Consulta de dirigentes y preferencia presidencial
            </p>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <ClientTabs los32={los32} los172={los172} initialAuthed={authed} />
      </main>
    </div>
  );
}
