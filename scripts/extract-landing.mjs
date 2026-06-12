import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.cwd());
const legacy = path.join(root, "legacy", "index.html");
const outDir = path.join(root, "app", "_landing");
fs.mkdirSync(outDir, { recursive: true });

const html = fs.readFileSync(legacy, "utf8");

// 1) CSS entre <style> y </style>
const css = html.match(/<style>([\s\S]*?)<\/style>/)[1].trim();
const cssAdapted = css
  .replace(
    '--font-display:"Bricolage Grotesque",sans-serif;',
    '--font-display:var(--font-bricolage),"Bricolage Grotesque",sans-serif;',
  )
  .replace(
    '--font-body:"Instrument Sans",sans-serif;',
    '--font-body:var(--font-instrument),"Instrument Sans",sans-serif;',
  );
fs.writeFileSync(path.join(outDir, "landing.css"), cssAdapted + "\n");

// 2) Marcado entre <body> y el primer <script>
const bodyStart = html.indexOf("<body>") + "<body>".length;
const scriptStart = html.indexOf("<script>", bodyStart);
const markup = html.slice(bodyStart, scriptStart).trim();
fs.writeFileSync(
  path.join(outDir, "markup.ts"),
  "// Generado desde legacy/index.html — no editar a mano.\n" +
    "export const LANDING_HTML = " +
    JSON.stringify(markup) +
    ";\n",
);

console.log("CSS:", cssAdapted.length, "chars");
console.log("Markup:", markup.length, "chars");
console.log("OK");
