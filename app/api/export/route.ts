import ExcelJS from "exceljs";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { CANDIDATOS } from "@/lib/candidatos";

export const dynamic = "force-dynamic";

interface DirigenteRow {
  id: number;
  grupo: string;
  numero_orden: number | null;
  cedula: string | null;
  nombre: string;
  cargo: string | null;
  ubicacion: string | null;
  preferencia: string | null;
  updated_at: string | null;
}

const FONT_NAME = "Arial";
const HEADER_FILL: ExcelJS.Fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1F4E78" } };
const NO_PREF_FILL: ExcelJS.Fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFF2CC" } };
const TOTAL_FILL: ExcelJS.Fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD9E2F3" } };
const HEADER_FONT: Partial<ExcelJS.Font> = { name: FONT_NAME, bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
const BASE_FONT: Partial<ExcelJS.Font> = { name: FONT_NAME, size: 10 };
const BOLD_FONT: Partial<ExcelJS.Font> = { name: FONT_NAME, size: 10, bold: true };
const TITLE_FONT: Partial<ExcelJS.Font> = { name: FONT_NAME, bold: true, size: 14, color: { argb: "FF1F4E78" } };
const SUB_FONT: Partial<ExcelJS.Font> = { name: FONT_NAME, italic: true, size: 9, color: { argb: "FF808080" } };
const THIN_BORDER: Partial<ExcelJS.Borders> = {
  top: { style: "thin", color: { argb: "FFD9D9D9" } },
  bottom: { style: "thin", color: { argb: "FFD9D9D9" } },
  left: { style: "thin", color: { argb: "FFD9D9D9" } },
  right: { style: "thin", color: { argb: "FFD9D9D9" } },
};

function colLetter(n: number): string {
  let s = "";
  while (n > 0) {
    const m = (n - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

function fmtFecha(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return new Intl.DateTimeFormat("es-DO", {
    timeZone: "America/Santo_Domingo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
}

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("dirigentes")
    .select("id, grupo, numero_orden, cedula, nombre, cargo, ubicacion, preferencia, updated_at")
    .order("grupo", { ascending: true })
    .order("numero_orden", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data ?? []) as DirigenteRow[];

  const workbook = new ExcelJS.Workbook();
  workbook.calcProperties.fullCalcOnLoad = true;

  const lastCandRow = CANDIDATOS.length + 1;
  const listaRange = `Listas!$A$2:$A$${lastCandRow}`;
  const lookupRange = `Listas!$A$2:$B$${lastCandRow}`;

  // ---------------- Hoja Tendencias ----------------
  const wsT = workbook.addWorksheet("Tendencias", { views: [{ showGridLines: false }] });
  wsT.mergeCells("A1:F1");
  wsT.getCell("A1").value = "Tendencias de Preferencia Presidencial — Comité Nacional DN";
  wsT.getCell("A1").font = TITLE_FONT;
  wsT.mergeCells("A2:F2");
  wsT.getCell("A2").value =
    'Se recalcula automáticamente al cambiar la columna "Código Pref." en las pestañas Comite 32 y Padron 172';
  wsT.getCell("A2").font = SUB_FONT;

  const HEADER_ROW = 4;
  const headersT = ["Código", "Candidato", "Comité 32", "Padrón 172", "Total", "% del Total"];
  headersT.forEach((h, idx) => {
    const cell = wsT.getCell(HEADER_ROW, idx + 1);
    cell.value = h;
    cell.font = HEADER_FONT;
    cell.fill = HEADER_FILL;
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = THIN_BORDER;
  });

  const firstRow = HEADER_ROW + 1;
  const totalRow = firstRow + CANDIDATOS.length + 1; // +1 fila "Sin definir"
  const range32 = "INDEX('Comite 32'!$E:$E,2):INDEX('Comite 32'!$E:$E,COUNTA('Comite 32'!$A:$A))";
  const range172 = "INDEX('Padron 172'!$E:$E,2):INDEX('Padron 172'!$E:$E,COUNTA('Padron 172'!$A:$A))";

  CANDIDATOS.forEach((c, i) => {
    const r = firstRow + i;
    wsT.getCell(`A${r}`).value = c.codigo;
    wsT.getCell(`B${r}`).value = c.nombre;
    wsT.getCell(`C${r}`).value = { formula: `COUNTIF(${range32},$A${r})` };
    wsT.getCell(`D${r}`).value = { formula: `COUNTIF(${range172},$A${r})` };
    wsT.getCell(`E${r}`).value = { formula: `C${r}+D${r}` };
    wsT.getCell(`F${r}`).value = { formula: `IFERROR(E${r}/$E$${totalRow},0)` };
  });

  const sdRow = firstRow + CANDIDATOS.length;
  wsT.getCell(`A${sdRow}`).value = "SD";
  wsT.getCell(`B${sdRow}`).value = "Sin definir";
  wsT.getCell(`C${sdRow}`).value = { formula: `COUNTBLANK(${range32})` };
  wsT.getCell(`D${sdRow}`).value = { formula: `COUNTBLANK(${range172})` };
  wsT.getCell(`E${sdRow}`).value = { formula: `C${sdRow}+D${sdRow}` };
  wsT.getCell(`F${sdRow}`).value = { formula: `IFERROR(E${sdRow}/$E$${totalRow},0)` };

  wsT.getCell(`B${totalRow}`).value = "Total";
  wsT.getCell(`C${totalRow}`).value = { formula: `SUM(C${firstRow}:C${sdRow})` };
  wsT.getCell(`D${totalRow}`).value = { formula: `SUM(D${firstRow}:D${sdRow})` };
  wsT.getCell(`E${totalRow}`).value = { formula: `SUM(E${firstRow}:E${sdRow})` };
  wsT.getCell(`F${totalRow}`).value = { formula: `SUM(F${firstRow}:F${sdRow})` };

  for (let r = firstRow; r <= totalRow; r++) {
    for (let j = 1; j <= 6; j++) {
      const cell = wsT.getCell(r, j);
      cell.border = THIN_BORDER;
      cell.font = r === totalRow ? BOLD_FONT : BASE_FONT;
      if (j === 3 || j === 4 || j === 5) cell.alignment = { horizontal: "center" };
      if (j === 6) {
        cell.numFmt = "0.0%";
        cell.alignment = { horizontal: "center" };
      }
      if (r === totalRow) cell.fill = TOTAL_FILL;
    }
  }

  wsT.columns = [{ width: 10 }, { width: 22 }, { width: 12 }, { width: 12 }, { width: 10 }, { width: 12 }];

  // ---------------- Hoja Listas (fuente de la lista desplegable) ----------------
  const wsL = workbook.addWorksheet("Listas", { state: "veryHidden" });
  wsL.getCell("A1").value = "Código";
  wsL.getCell("B1").value = "Candidato";
  wsL.getCell("A1").font = HEADER_FONT;
  wsL.getCell("A1").fill = HEADER_FILL;
  wsL.getCell("B1").font = HEADER_FONT;
  wsL.getCell("B1").fill = HEADER_FILL;
  CANDIDATOS.forEach((c, i) => {
    const r = i + 2;
    wsL.getCell(`A${r}`).value = c.codigo;
    wsL.getCell(`B${r}`).value = c.nombre;
  });
  wsL.columns = [{ width: 10 }, { width: 22 }];

  function buildDataSheet(
    name: string,
    headers: string[],
    widths: number[],
    keys: string[],
    rowsData: Record<string, string | number>[],
    prefColLetter: string,
    prefNameColLetter: string
  ) {
    const ws = workbook.addWorksheet(name, {
      views: [{ showGridLines: false, state: "frozen", ySplit: 1 }],
    });

    headers.forEach((h, idx) => {
      const cell = ws.getCell(1, idx + 1);
      cell.value = h;
      cell.font = HEADER_FONT;
      cell.fill = HEADER_FILL;
      cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
      cell.border = THIN_BORDER;
    });

    const n = rowsData.length;
    rowsData.forEach((row, i) => {
      const r = i + 2;
      keys.forEach((key, idx) => {
        const letter = colLetter(idx + 1);
        const cell = ws.getCell(r, idx + 1);
        if (letter === prefNameColLetter) {
          cell.value = {
            formula: `IFERROR(VLOOKUP(${prefColLetter}${r},${lookupRange},2,FALSE),"Sin definir")`,
          };
        } else {
          cell.value = row[key] ?? "";
        }
        cell.font = BASE_FONT;
        cell.border = THIN_BORDER;
        cell.alignment = {
          vertical: "middle",
          wrapText: key === "cargo" || key === "ubicacion" || key === "nombre",
        };
      });
    });

    // exceljs soporta `dataValidations.add()` para un rango en tiempo de ejecución,
    // pero sus typings no lo declaran en Worksheet; se castea puntualmente aquí.
    (ws as unknown as { dataValidations: { add(ref: string, dv: ExcelJS.DataValidation): void } }).dataValidations.add(
      `${prefColLetter}2:${prefColLetter}${n + 1}`,
      {
        type: "list",
        allowBlank: true,
        formulae: [listaRange],
        error: "Selecciona un código válido de la lista",
        errorTitle: "Valor inválido",
      }
    );

    ws.addConditionalFormatting({
      ref: `A2:${colLetter(headers.length)}${n + 1}`,
      rules: [
        {
          type: "expression",
          formulae: [`$${prefColLetter}2=""`],
          style: { fill: NO_PREF_FILL },
          priority: 1,
        },
      ],
    });

    ws.autoFilter = `A1:${colLetter(headers.length)}${n + 1}`;
    widths.forEach((w, idx) => {
      ws.getColumn(idx + 1).width = w;
    });
    return ws;
  }

  const g32 = rows
    .filter((d) => d.grupo === "32")
    .sort((a, b) => (a.numero_orden ?? 0) - (b.numero_orden ?? 0));
  const rows32 = g32.map((d) => ({
    numero_orden: d.numero_orden ?? "",
    cedula: d.cedula ?? "",
    nombre: d.nombre,
    cargo: d.cargo ?? "",
    preferencia: d.preferencia ?? "",
    updated_at: fmtFecha(d.updated_at),
  }));
  buildDataSheet(
    "Comite 32",
    ["No.", "Cédula", "Nombre", "Cargo", "Código Pref.", "Preferencia Presidencial", "Última Actualización"],
    [6, 16, 34, 46, 12, 24, 20],
    ["numero_orden", "cedula", "nombre", "cargo", "preferencia", "preferencia_nombre", "updated_at"],
    rows32,
    "E",
    "F"
  );

  const g172 = rows
    .filter((d) => d.grupo === "172")
    .sort((a, b) => (a.numero_orden ?? 0) - (b.numero_orden ?? 0));
  const rows172 = g172.map((d) => ({
    numero_orden: d.numero_orden ?? "",
    nombre: d.nombre,
    cargo: d.cargo ?? "",
    ubicacion: d.ubicacion ?? "",
    preferencia: d.preferencia ?? "",
    updated_at: fmtFecha(d.updated_at),
  }));
  buildDataSheet(
    "Padron 172",
    ["No.", "Nombre", "Cargo", "Ubicación de Votación", "Código Pref.", "Preferencia Presidencial", "Última Actualización"],
    [6, 34, 46, 24, 12, 24, 20],
    ["numero_orden", "nombre", "cargo", "ubicacion", "preferencia", "preferencia_nombre", "updated_at"],
    rows172,
    "E",
    "F"
  );

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="Comite_Nacional_DN_Datos.xlsx"',
      "Cache-Control": "no-store",
    },
  });
}
