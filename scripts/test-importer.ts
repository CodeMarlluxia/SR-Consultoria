/**
 * Quick sanity check for the CSV importer.
 *
 *   npx tsx scripts/test-importer.ts caminho/para/relatorio.csv
 *
 * Reads a report as ISO-8859-1, runs the same parsing/sanitization logic
 * used in the browser, and prints per-professional totals so you can eyeball
 * them against the source report before wiring up the DB.
 *
 * (Node-only helper — the app itself parses File objects in the browser.)
 */
import fs from "node:fs";
import iconv from "iconv-lite";
import Papa from "papaparse";
import { processRows, aggregateByProfessional } from "@/lib/csv/importer";

const path = process.argv[2];
if (!path) {
  console.error("Uso: npx tsx scripts/test-importer.ts <arquivo.csv>");
  process.exit(1);
}

const buffer = fs.readFileSync(path);
const text = iconv.decode(buffer, "ISO-8859-1");
const parsed = Papa.parse<string[]>(text, { delimiter: ";", skipEmptyLines: true });

const result = processRows(parsed.data);

if (result.errors.length) {
  console.log("Avisos:");
  result.errors.forEach((e) => console.log("  -", e));
  console.log();
}

console.log(`Linhas processadas: ${result.rows.length}`);
console.log(`Profissionais: ${result.professionals.join(", ")}`);
console.log();

const agg = aggregateByProfessional(result.rows);
const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

let totalFat = 0;
let totalCom = 0;
for (const a of agg) {
  console.log(
    `${a.profissional.padEnd(14)} ${String(a.qtdLinhas).padStart(4)} linhas` +
      `  fat: ${brl(a.faturamento).padStart(14)}  com: ${brl(a.comissaoAcumulada).padStart(12)}`,
  );
  totalFat += a.faturamento;
  totalCom += a.comissaoAcumulada;
}
console.log("-".repeat(70));
console.log(`TOTAL  fat: ${brl(totalFat)}   com: ${brl(totalCom)}`);
