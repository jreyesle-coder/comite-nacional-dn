# Comité Nacional PRM — Distrito Nacional

App de consulta del Comité Nacional (32 miembros) y del Padrón Fotográfico /
Directorio Institucional (172 miembros) del Distrito Nacional, con marcado de
preferencia presidencial por dirigente.

**Stack:** Next.js 14 (App Router) + TypeScript + Tailwind + Supabase.

## 1. Crear el proyecto en Supabase

1. Entra a [supabase.com](https://supabase.com) y crea un proyecto nuevo (o usa uno existente).
2. Ve a **SQL Editor** y pega el contenido completo de
   [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql). Ejecútalo.
   Esto crea la tabla `dirigentes`, la política de lectura pública, y siembra
   los 32 + 170 dirigentes ya extraídos de los padrones.
3. Ve a **Project Settings → API** y copia:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role key` → `SUPABASE_SERVICE_ROLE_KEY` (¡nunca la expongas en el cliente!)

## 2. Variables de entorno

Copia `.env.local.example` a `.env.local` y completa los valores:

```bash
cp .env.local.example .env.local
```

- `APP_PASSWORD`: la contraseña compartida para poder marcar preferencia (la
  consulta de datos es pública; solo editar requiere esta clave).
- `AUTH_SECRET`: cualquier cadena aleatoria, solo se usa para firmar la cookie de sesión.

## 3. Desarrollo local

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## 4. Despliegue en Vercel

1. Sube el repo a GitHub (ya incluido en este proyecto).
2. En [vercel.com/new](https://vercel.com/new) importa el repositorio.
3. Agrega las mismas variables de entorno del paso 2 en **Project Settings → Environment Variables**.
4. Deploy.

## Notas sobre los datos

- **Comité de los 32**: viene de `Directorio_Comite_Nacional_DISTRITO_NACIONAL.xlsx` (cédula, nombre, cargo).
- **Comité de los 172**: viene del Padrón Fotográfico / Directorio Institucional
  en PDF (170 registros validados al momento de la extracción; nombre, cargo, ubicación).
- La columna `preferencia` solo acepta los códigos: `DC` (David Collado),
  `CM` (Carolina Mejía), `WA` (Wellington Arnaud), `GG` (Guido Gómez),
  `YL` (Yayo Sanz Lovatón), `TP` (Tony Peña).
- Si llegan padrones nuevos de otras provincias, se pueden agregar con el mismo
  patrón de `insert into public.dirigentes (...) values (...) on conflict (grupo, numero_orden) do nothing;`
  usando un valor de `grupo` nuevo o reutilizando `32`/`172` con `numero_orden` distinto.
