export type CodigoCandidato = "DC" | "CM" | "WA" | "GG" | "YL" | "TP";

export interface Candidato {
  codigo: CodigoCandidato;
  nombre: string;
  color: string;
}

export const CANDIDATOS: Candidato[] = [
  { codigo: "DC", nombre: "David Collado", color: "bg-blue-100 text-blue-800 border-blue-300" },
  { codigo: "CM", nombre: "Carolina Mejía", color: "bg-pink-100 text-pink-800 border-pink-300" },
  { codigo: "WA", nombre: "Wellington Arnaud", color: "bg-emerald-100 text-emerald-800 border-emerald-300" },
  { codigo: "GG", nombre: "Guido Gómez", color: "bg-amber-100 text-amber-800 border-amber-300" },
  { codigo: "YL", nombre: "Yayo Sanz Lovatón", color: "bg-purple-100 text-purple-800 border-purple-300" },
  { codigo: "TP", nombre: "Tony Peña", color: "bg-orange-100 text-orange-800 border-orange-300" },
];

export function candidatoPorCodigo(codigo: string | null): Candidato | undefined {
  if (!codigo) return undefined;
  return CANDIDATOS.find((c) => c.codigo === codigo);
}
