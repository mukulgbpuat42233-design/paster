import JSZip from 'jszip';
import { TEMPLATE_B64 } from '../constants/template';
import { PLANTS, NEED, SECTIONS } from '../constants';
import { PlantCheck, VerificationResult } from '../types';

export function esc(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function colName(n: number): string {
  let s = "";
  n++;
  while (n > 0) {
    const r = (n - 1) % 26;
    s = String.fromCharCode(65 + r) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

export function colNum(ref: string): number {
  const m = String(ref).match(/^([A-Z]+)/);
  if (!m) return 0;
  let n = 0;
  for (const ch of m[1]) {
    n = n * 26 + (ch.charCodeAt(0) - 64);
  }
  return n - 1;
}

export function parseXML(txt: string): Document {
  return new DOMParser().parseFromString(txt, "application/xml");
}

export function getText(node: Element | null): string {
  if (!node) return "";
  const t = node.querySelector("t");
  return t ? t.textContent || "" : "";
}

export function parseSheet(xml: string, ss: string[]): string[][] {
  const doc = parseXML(xml);
  const rows: string[][] = [];
  doc.querySelectorAll("sheetData > row").forEach((r) => {
    const arr: string[] = [];
    r.querySelectorAll(":scope > c").forEach((c) => {
      const ref = c.getAttribute("r") || "";
      const idx = colNum(ref);
      const typ = c.getAttribute("t");
      const v = c.querySelector("v");
      const is = c.querySelector("is");
      let val = "";
      if (typ === "s") {
        val = ss[Number(v?.textContent || 0)] ?? "";
      } else if (typ === "inlineStr") {
        val = getText(is);
      } else {
        val = v ? v.textContent || "" : "";
      }
      arr[idx] = val;
    });
    const rowNum = Number(r.getAttribute("r")) - 1;
    rows[rowNum] = arr;
  });
  return rows;
}

export async function parseXlsx(file: File | ArrayBuffer | Uint8Array): Promise<Record<string, string[][]>> {
  const zip = await JSZip.loadAsync(file);
  const ss: string[] = [];
  const sharedStrFile = zip.file("xl/sharedStrings.xml");
  if (sharedStrFile) {
    const x = parseXML(await sharedStrFile.async("text"));
    x.querySelectorAll("si").forEach((si) =>
      ss.push(Array.from(si.querySelectorAll("t")).map((t) => t.textContent).join(""))
    );
  }

  const wbFile = zip.file("xl/workbook.xml");
  const relFile = zip.file("xl/_rels/workbook.xml.rels");
  if (!wbFile || !relFile) {
    throw new Error("Invalid Excel workbook: missing workbook.xml or relationships");
  }

  const wb = parseXML(await wbFile.async("text"));
  const rel = parseXML(await relFile.async("text"));
  const relmap: Record<string, string> = {};
  rel.querySelectorAll("Relationship").forEach((r) => {
    const id = r.getAttribute("Id");
    const target = r.getAttribute("Target");
    if (id && target) relmap[id] = target;
  });

  const out: Record<string, string[][]> = {};
  const sheetNodes = wb.querySelectorAll("sheet");
  for (const sh of Array.from(sheetNodes)) {
    const name = sh.getAttribute("name");
    const rid = sh.getAttribute("r:id") || sh.getAttributeNS("http://schemas.openxmlformats.org/officeDocument/2006/relationships", "id");
    if (!name || !rid) continue;
    let target = relmap[rid] || "";
    if (target.startsWith("/")) target = target.slice(1);
    if (!target.startsWith("xl/")) target = "xl/" + target.replace(/^\//, "");
    const f = zip.file(target);
    if (!f) continue;
    out[name] = parseSheet(await f.async("text"), ss);
  }

  return out;
}

export function norm(v: unknown): string {
  return String(v ?? "").trim().toUpperCase();
}

export function parseDMY(s: string): Date | null {
  const m = String(s).trim().match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (!m) return null;
  return new Date(Date.UTC(+m[3], +m[2] - 1, +m[1]));
}

export function fmtDMY(d: Date): string {
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${dd}-${mm}-${d.getUTCFullYear()}`;
}

export function addDays(s: string, n: number): string {
  const d = parseDMY(s);
  if (!d) throw new Error("Invalid date: " + s);
  d.setUTCDate(d.getUTCDate() + n);
  return fmtDMY(d);
}

export function key(plant: string, date: string): string {
  return norm(plant) + "|" + String(date).trim();
}

export function buildIndex(rows: string[][], plantCol: number | null, dateCol: number) {
  const m = new Map<string, string[]>();
  const dup: { k: string; row: number }[] = [];
  for (let i = 2; i < rows.length; i++) {
    const r = rows[i] || [];
    if (!r.length) continue;
    const p = plantCol == null ? "" : norm(r[plantCol]);
    const d = String(r[dateCol] ?? "").trim();
    if (!d) continue;
    const k = key(p, d);
    if (m.has(k)) {
      dup.push({ k, row: i + 1 });
    } else {
      m.set(k, r);
    }
  }
  return { m, dup };
}

export function findFrequencyIndex(rows: string[][]) {
  const m = new Map<string, string[]>();
  const dup: { d: string; row: number }[] = [];
  for (let i = 2; i < rows.length; i++) {
    const r = rows[i] || [];
    const d = String(r[0] ?? "").trim();
    if (!d) continue;
    if (m.has(d)) {
      dup.push({ d, row: i + 1 });
    } else {
      m.set(d, r);
    }
  }
  return { m, dup };
}

export function getRow(data: Record<string, string[][]>, sheet: string, plant: string, date: string): string[] | undefined {
  const rows = data[sheet];
  if (!rows) return undefined;
  const pc = sheet === "Reference_Rate" ? 1 : 0;
  const dc = sheet === "Reference_Rate" ? 0 : 1;
  const im = buildIndex(rows, pc, dc).m;
  return im.get(key(plant, date));
}

export function getFreq(data: Record<string, string[][]>, date: string): string[] | undefined {
  const rows = data.Frequency;
  if (!rows) return undefined;
  return findFrequencyIndex(rows).m.get(date);
}

export function cellRegex(ref: string): RegExp {
  return new RegExp('<c\\b([^>]*\\br="' + ref + '"[^>]*)>([\\s\\S]*?)</c>|<c\\b([^>]*\\br="' + ref + '"[^>]*)\\s*/>', 'i');
}

export function setCell(xml: string, ref: string, value: string | number | null | undefined): string {
  const re = cellRegex(ref);
  const m = xml.match(re);
  let attrs = "";
  if (m) {
    attrs = m[1] || m[3] || "";
  } else {
    throw new Error("Template cell " + ref + " is missing.");
  }
  attrs = attrs.replace(/\s+t="[^"]*"/g, "");
  let content = "";
  if (value === null || value === undefined || value === "") {
    content = "";
  } else if (typeof value === "number" && Number.isFinite(value)) {
    content = '<v>' + String(value) + '</v>';
  } else {
    attrs += ' t="inlineStr"';
    content = '<is><t xml:space="preserve">' + esc(value) + '</t></is>';
  }
  const replacement = '<c ' + attrs + '>' + content + '</c>';
  return xml.replace(re, replacement);
}

export function setText(xml: string, ref: string, val: unknown): string {
  return setCell(xml, ref, String(val ?? ""));
}

export function setNum(xml: string, ref: string, val: unknown): string {
  const n = Number(val);
  return setCell(xml, ref, Number.isFinite(n) ? n : 0);
}

export function isoWeekInfo(dmy: string): { year: number; week: number } {
  const d = parseDMY(dmy);
  if (!d) throw new Error("Invalid week-start date: " + dmy);
  const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = x.getUTCDay() || 7;
  x.setUTCDate(x.getUTCDate() + 4 - day);
  const isoYear = x.getUTCFullYear();
  const yearStart = new Date(Date.UTC(isoYear, 0, 1));
  const week = Math.ceil((((x.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return { year: isoYear, week };
}

export function headerUniform(xml: string, row: number): string {
  xml = setText(xml, "A" + row, "Project_Name");
  xml = setText(xml, "B" + row, "Date");
  for (let b = 0; b < 96; b++) {
    xml = setText(xml, colName(2 + b) + row, "D" + (b + 1));
  }
  return xml;
}

export async function verifyWorkbook(file: File): Promise<VerificationResult> {
  const data = await parseXlsx(file);
  const missingSheets = NEED.filter((s) => !data[s]);
  if (missingSheets.length) {
    throw new Error("Missing required source sheets: " + missingSheets.join(", "));
  }

  const gs = data.GS_Stations;
  if (!gs || gs.length < 3) {
    throw new Error("GS_Stations sheet contains insufficient data rows.");
  }

  const candidates: { start: string; dates: string[] }[] = [];
  const starts = new Set<string>();

  for (let i = 2; i < gs.length; i++) {
    const r = gs[i] || [];
    const p = norm(r[0]);
    const d = String(r[1] ?? "").trim();
    if (PLANTS.includes(p as any) && d) {
      starts.add(d);
    }
  }

  const sortedStarts = Array.from(starts).sort((a, b) => {
    const da = parseDMY(a)?.getTime() ?? 0;
    const db = parseDMY(b)?.getTime() ?? 0;
    return da - db;
  });

  for (const start of sortedStarts) {
    let dates: string[];
    try {
      dates = Array.from({ length: 7 }, (_, i) => addDays(start, i));
    } catch {
      continue;
    }
    let ok = true;
    for (const pl of PLANTS) {
      const gsRowMap = buildIndex(gs, 0, 1).m;
      for (const d of dates) {
        if (!gsRowMap.has(key(pl, d))) ok = false;
      }
      for (const sh of ["Act_Inj_Gen_Stations", "SRAS", "Deviation_Charges", "Reference_Rate"]) {
        const rows = data[sh];
        if (!rows) {
          ok = false;
          continue;
        }
        const pc = sh === "Reference_Rate" ? 1 : 0;
        const dc = sh === "Reference_Rate" ? 0 : 1;
        const im = buildIndex(rows, pc, dc).m;
        for (const d of dates) {
          if (!im.has(key(pl, d))) ok = false;
        }
      }
    }
    const freqMap = findFrequencyIndex(data.Frequency).m;
    for (const d of dates) {
      if (!freqMap.has(d)) ok = false;
    }
    if (ok) {
      candidates.push({ start, dates });
      break;
    }
  }

  if (!candidates.length) {
    throw new Error("No complete 7-day window found for all 3 plants in the uploaded NRPC workbook.");
  }

  const win = candidates[0];
  const checks: PlantCheck[] = [];
  for (const pl of PLANTS) {
    const c: PlantCheck = {
      plant: pl,
      GS_Stations: 0,
      SRAS: 0,
      Act_Inj_Gen_Stations: 0,
      Frequency: 0,
      Reference_Rate: 0,
      Deviation_Charges: 0,
    };
    for (const sh of ["GS_Stations", "SRAS", "Act_Inj_Gen_Stations", "Reference_Rate", "Deviation_Charges"] as const) {
      const rows = data[sh];
      if (rows) {
        const pc = sh === "Reference_Rate" ? 1 : 0;
        const dc = sh === "Reference_Rate" ? 0 : 1;
        const im = buildIndex(rows, pc, dc).m;
        c[sh] = win.dates.filter((d) => im.has(key(pl, d))).length;
      }
    }
    c.Frequency = win.dates.filter((d) => findFrequencyIndex(data.Frequency).m.has(d)).length;
    checks.push(c);
  }

  const isoWeek = isoWeekInfo(win.dates[0]);

  return {
    data,
    dates: win.dates,
    checks,
    isoWeek,
  };
}

export async function makePlantWorkbook(
  plant: string,
  data: Record<string, string[][]>,
  dates: string[]
): Promise<Blob> {
  const binaryString = atob(TEMPLATE_B64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const zip = await JSZip.loadAsync(bytes);
  const sheetFile = zip.file("xl/worksheets/sheet1.xml");
  if (!sheetFile) {
    throw new Error("Template worksheet sheet1.xml missing");
  }

  let xml = await sheetFile.async("text");

  // Make every parameter table structurally identical:
  // Column A = Project_Name, Column B = Date, Columns C:CV = 96 block values.
  // Tables: 1: GS(2), 2: SRAS(13), 3: TotalSched(24), 4: ActInj(35), 5: AbsDev(46), 6: Freq(57), 7: RefRate(68), 8: DevCharge(79)
  for (const r of [2, 13, 24, 35, 46, 57, 68, 79]) {
    xml = headerUniform(xml, r);
  }

  // All 8 parameter datasets use exactly 7 data rows.
  for (let di = 0; di < 7; di++) {
    const d = dates[di];

    // Ensure formula sections also have Project_Name and Date populated for each of the 7 days:
    // Section 3: Total Scheduled Gen in LU (rows 25–31)
    xml = setText(xml, "A" + (25 + di), plant);
    xml = setText(xml, "B" + (25 + di), d);

    // Section 5: Absolute Deviation in LU (rows 47–53)
    xml = setText(xml, "A" + (47 + di), plant);
    xml = setText(xml, "B" + (47 + di), d);

    // Populate data-driven sections
    for (const sec of SECTIONS) {
      const rr = sec.startRow + di;
      let r: string[] | undefined;

      if (sec.name === "Frequency") {
        r = getFreq(data, d);
        if (!r) throw new Error("Missing Frequency for " + d);
        xml = setText(xml, "A" + rr, plant);
        xml = setText(xml, "B" + rr, d);
        for (let b = 0; b < 96; b++) {
          const val = Number(r[1 + b]);
          if (!Number.isFinite(val)) {
            throw new Error(`Invalid numeric value in Frequency for ${d} / block ${b + 1}`);
          }
          xml = setNum(xml, colName(2 + b) + rr, val);
        }
      } else if (sec.name === "Reference_Rate") {
        r = getRow(data, sec.name, plant, d);
        if (!r) throw new Error(`Missing Reference Rate for ${plant} / ${d}`);
        xml = setText(xml, "A" + rr, plant);
        xml = setText(xml, "B" + rr, d);
        for (let b = 0; b < 96; b++) {
          const val = Number(r[2 + b]);
          if (!Number.isFinite(val)) {
            throw new Error(`Invalid numeric value in Reference Rate for ${plant} / ${d} / block ${b + 1}`);
          }
          xml = setNum(xml, colName(2 + b) + rr, val);
        }
      } else {
        r = getRow(data, sec.name, plant, d);
        if (!r) throw new Error(`Missing ${sec.name} for ${plant} / ${d}`);
        xml = setText(xml, "A" + rr, plant);
        xml = setText(xml, "B" + rr, d);
        for (let b = 0; b < 96; b++) {
          const val = Number(r[sec.dataStartCol + b]);
          if (!Number.isFinite(val)) {
            throw new Error(`Invalid numeric value in ${sec.name} for ${plant} / ${d} / block ${b + 1}`);
          }
          xml = setNum(xml, colName(2 + b) + rr, val);
        }
      }
    }
  }

  // Preserve formulas from the supplied template and set calcPr
  const calc = '<calcPr calcId="191029" calcMode="auto" fullCalcOnLoad="1" forceFullCalc="1"/>';
  if (/<calcPr[^>]*\/>/i.test(xml)) {
    xml = xml.replace(/<calcPr[^>]*\/>/i, calc);
  }
  zip.file("xl/worksheets/sheet1.xml", xml);

  if (zip.file("xl/calcChain.xml")) {
    zip.remove("xl/calcChain.xml");
  }

  const wbFile = zip.file("xl/workbook.xml");
  if (wbFile) {
    let wbxml = await wbFile.async("text");
    if (/<calcPr[^>]*\/>/i.test(wbxml)) {
      wbxml = wbxml.replace(/<calcPr[^>]*\/>/i, calc);
    } else if (/<\/workbookPr>/i.test(wbxml)) {
      wbxml = wbxml.replace(/<\/workbookPr>/i, '</workbookPr>' + calc);
    }
    zip.file("xl/workbook.xml", wbxml);
  }

  return await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 }
  });
}

export async function makeAllPlantsZip(
  data: Record<string, string[][]>,
  dates: string[],
  isoWeek: { year: number; week: number }
): Promise<Blob> {
  const zip = new JSZip();
  const weekNum = String(isoWeek.week).padStart(2, '0');
  for (const plant of PLANTS) {
    const plantBlob = await makePlantWorkbook(plant, data, dates);
    const plantFileName = plant.replace(/ /g, '_');
    const fileName = `THDCIL_Week_${weekNum}_${isoWeek.year}_${plantFileName}_LU_DSM.xlsx`;
    zip.file(fileName, plantBlob);
  }
  return await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });
}
