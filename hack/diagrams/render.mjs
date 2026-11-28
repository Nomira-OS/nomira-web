// Renders every ```mermaid code block below content/ to
// assets/diagrams/<id>.svg, which the render hook
// layouts/_default/_markup/render-codeblock-mermaid.html puts inline into
// the page. <id> is the first 16 hex digits of the sha256 of the block's
// text, as the hook computes it, so a changed diagram without a new SVG
// stops the Hugo build instead of showing the old picture.
//
// One SVG serves both themes: the diagram is rendered with stand-in
// colours, which are then replaced by the site's custom properties
// (var(--surface), …). The text is measured with Inter, the site's font;
// install it (fc-match Inter) to get the same widths.
//
//   cd hack/diagrams && npm ci && node render.mjs
//
// Chrome comes from puppeteer (npx puppeteer browsers install
// chrome-headless-shell) or from PUPPETEER_EXECUTABLE_PATH.
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import puppeteer from "puppeteer";
import { renderMermaid } from "@mermaid-js/mermaid-cli";

const root = path.resolve(import.meta.dirname, "../..");
const contentDir = path.join(root, "content");
const outDir = path.join(root, "assets/diagrams");

// Stand-in colour → custom property of the site (assets/css/main.css).
const tokens = {
  1: "var(--bg)",
  2: "var(--surface)",
  3: "var(--text)",
  4: "var(--border)",
  5: "var(--surface-2)",
  6: "var(--bg)",
  7: "var(--muted)",
  8: "var(--accent)",
  9: "var(--accent-2)",
};
const standIn = (n) => "#" + n.toString(16).padStart(6, "0");

const mermaidConfig = {
  theme: "base",
  themeVariables: {
    fontFamily: "Inter, system-ui, sans-serif",
    fontSize: "15px",
    background: standIn(1),
    primaryColor: standIn(2),
    mainBkg: standIn(2),
    primaryTextColor: standIn(3),
    nodeTextColor: standIn(3),
    textColor: standIn(3),
    titleColor: standIn(3),
    primaryBorderColor: standIn(4),
    nodeBorder: standIn(4),
    clusterBorder: standIn(4),
    secondaryColor: standIn(5),
    clusterBkg: standIn(5),
    tertiaryColor: standIn(6),
    lineColor: standIn(7),
    defaultLinkColor: standIn(7),
    edgeLabelBackground: standIn(1),
  },
  // Classes a diagram may use: "class X accent" for the box that matters,
  // "class X quiet" for what is only context.
  themeCSS: [
    `.accent > rect, .accent > polygon, .accent > path, .accent > circle { stroke: ${standIn(8)} !important; stroke-width: 2px !important; }`,
    `.quiet > rect, .quiet > polygon, .quiet > path { stroke-dasharray: 4 3; }`,
    `.edgeLabel rect { opacity: 1 !important; }`,
    `.node rect, .node polygon, .node path, .node circle, .cluster rect { filter: none !important; }`,
  ].join("\n"),
  flowchart: { htmlLabels: false, curve: "basis", useMaxWidth: true, padding: 12, wrappingWidth: 240 },
  securityLevel: "strict",
};

// The text of every ```mermaid block, as Hugo's .Inner has it: the lines
// between the fences, without the last newline.
async function blocks(dir) {
  const found = [];
  for (const entry of await readdir(dir, { withFileTypes: true, recursive: true })) {
    if (!entry.isFile() || !entry.name.endsWith(".md")) continue;
    const file = path.join(entry.parentPath, entry.name);
    const text = await readFile(file, "utf8");
    for (const m of text.matchAll(/^```mermaid[^\n]*\n([\s\S]*?)\n```[ \t]*$/gm)) {
      found.push({ file: path.relative(root, file), source: m[1] });
    }
  }
  return found;
}

// On a narrow screen a diagram keeps a readable size and scrolls inside
// its figure instead of shrinking to fit.
function minWidth(svg) {
  return svg.replace(/^(<svg[^>]*style="max-width: ([0-9.]+)px;)/, "$1 min-width: min($2px, 30rem);");
}

function toTokens(svg) {
  let out = svg;
  for (const [n, value] of Object.entries(tokens)) {
    const hex = standIn(Number(n));
    out = out.replaceAll(new RegExp(`${hex}\\b`, "gi"), value);
    out = out.replaceAll(new RegExp(`rgba?\\(0, ?0, ?${n}(, ?[0-9.]+)?\\)`, "g"), value);
  }
  const left = out.match(/#0000(0[1-9])\b|rgba?\(0, ?0, ?[1-9][,)]/);
  if (left) throw new Error(`stand-in colour ${left[0]} left in the SVG`);
  return out;
}

try {
  const fam = execFileSync("fc-match", ["-f", "%{family}", "Inter"], { encoding: "utf8" });
  if (!fam.split(",").includes("Inter")) console.warn("Inter is not installed; text widths will differ from the site");
} catch {
  console.warn("fc-match not found; cannot check that Inter is installed");
}

const all = await blocks(contentDir);
await mkdir(outDir, { recursive: true });
const wanted = new Set();
const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] });
try {
  for (const { file, source } of all) {
    const id = createHash("sha256").update(source).digest("hex").slice(0, 16);
    wanted.add(`${id}.svg`);
    const { data } = await renderMermaid(browser, source, "svg", {
      backgroundColor: "transparent",
      mermaidConfig,
      svgId: `d${id}`,
      fontEmbed: false,
    });
    await writeFile(path.join(outDir, `${id}.svg`), minWidth(toTokens(new TextDecoder().decode(data))));
    console.log(`${id}  ${file}`);
  }
} finally {
  await browser.close();
}
for (const name of await readdir(outDir)) {
  if (name.endsWith(".svg") && !wanted.has(name)) {
    await rm(path.join(outDir, name));
    console.log(`removed ${name}`);
  }
}
