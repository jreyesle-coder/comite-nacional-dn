"use server";

import { revalidatePath } from "next/cache";
import { checkPassword, clearAuthCookie, isAuthed, setAuthCookie } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { CANDIDATOS } from "@/lib/candidatos";

export async function login(password: string) {
  if (!checkPassword(password)) {
    return { ok: false, error: "Contraseña incorrecta" };
  }
  await setAuthCookie();
  return { ok: true };
}

export async function logout() {
  await clearAuthCookie();
}

export async function getAuthStatus() {
  return isAuthed();
}

export async function updatePreferencia(id: number, preferencia: string | null) {
  const authed = await isAuthed();
  if (!authed) {
    return { ok: false, error: "Debes ingresar la contraseña para editar." };
  }

  if (preferencia !== null && !CANDIDATOS.some((c) => c.codigo === preferencia)) {
    return { ok: false, error: "Preferencia inválida." };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("dirigentes")
    .update({ preferencia, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/");
  return { ok: true };
}
