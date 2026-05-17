#!/usr/bin/env npx ts-node

/**
 * CV Builder
 * Generates PDF from the same markdown content files used by the website.
 *
 * Usage: npx ts-node build.ts
 * Or: npm run cv
 */

import { readFileSync, writeFileSync, readdirSync } from "fs";
import { execSync } from "child_process";
import { join } from "path";
import fm from "front-matter";

// Types
interface WorkProject {
  title: string;
  role: string;
  period: string;
  tags: string[];
  link: string | null;
  order: number;
}

interface ArtContent {
  title: string;
  shopLink?: string;
  content: string;
}

// Paths
const CONTENT_DIR = join(__dirname, "../content");
const OUTPUT_DIR = join(__dirname, "../public");

// Read and parse markdown files
function readMarkdownFiles<T>(
  dir: string,
): Array<T & { content: string; slug: string }> {
  const files = readdirSync(dir).filter((f) => f.endsWith(".md"));
  return files.map((file) => {
    const raw = readFileSync(join(dir, file), "utf-8");
    const { attributes, body } = fm<T>(raw);
    return {
      ...attributes,
      content: body.trim(),
      slug: file.replace(".md", ""),
    };
  });
}

// Strip shields.io badges from content
function stripBadges(content: string): string {
  return content
    .replace(/!\[stars\]\([^)]+\)/g, "")
    .replace(/\n\n+/g, "\n\n")
    .trim();
}

// Generate CV markdown
function generateCV(): string {
  const allWork = readMarkdownFiles<WorkProject>(
    join(CONTENT_DIR, "work"),
  ).sort((a, b) => a.order - b.order);

  // Separate regular work from open source
  const work = allWork.filter((p) => p.slug !== "opensource");
  const opensource = allWork.find((p) => p.slug === "opensource");

  const art = readMarkdownFiles<ArtContent>(join(CONTENT_DIR, "art"));
  const artAbout = art.find((a) => a.slug === "about");
  const exhibitions = art.find((a) => a.slug === "exhibitions");

  return `---
title: Alexander Milevski
subtitle: Front-end / Visualization / GIS Engineer
margin-left: 1.2in
margin-right: 1.2in
margin-top: 1in
margin-bottom: 1in
mainfont: Palatino
fontsize: 11pt
---

<div style="text-align: center; margin-bottom: 1em;">

# Alexander Milevski

**Front-end / Visualization / GIS Engineer**

[alex@milevski.co](mailto:alex@milevski.co) · [milevski.co](https://milevski.co) · [github.com/w8r](https://github.com/w8r) · Paris, France

</div>

Software engineer building complex web applications and libraries at the intersection of creativity and technology. Specialized in web cartography, computational geometry, data visualization, and graph algorithms.

## Experience

${work
  .map(
    (project) => `
### ${project.title}

**${project.role}** · ${project.period}${project.link ? ` · [${new URL(project.link).hostname}](${project.link})` : ""}

${stripBadges(project.content)}
`,
  )
  .join("\n")}

### ${opensource?.title || "Open Source"}

**${opensource?.role || "Creator & Maintainer"}** · ${opensource?.period || ""}${opensource?.link ? ` · [${new URL(opensource.link).hostname}](${opensource.link})` : ""}

${stripBadges(opensource?.content || "")}

## Skills

| | |
|:---|:---|
| **Languages** | TypeScript, JavaScript, HTML/CSS, SQL, some C++ |
| **Visualization** | WebGL, Canvas, SVG, D3.js, Three.js, graph algorithms |
| **GIS** | Leaflet, OpenLayers, Mapbox, ArcGIS API, Geoserver, PostGIS |
| **Front-end** | React, Vue, performance optimization, large codebase architecture |
| **Tools** | Git, Vite, Node.js, Docker, CI/CD |
| **Languages** | English (fluent), French (conversational), German (basic), Russian (native), Polish (basic) |

## Education

**Moscow State Institute for Electronics and Mathematics**
Computer Science, 2003–2008
*Thesis: Edge detection in image processing using neural networks*

**Moscow State Institute for Electronics and Mathematics**
Graphic Design, 2005–2009

**Krasnopresnenskaya Art School**
1992–2003, First Degree Diploma

## Art & Exhibitions

${artAbout?.content || "Drawing, painting, sculpture, and book art."}

${exhibitions?.content || ""}

Art shop: [art.milevski.co](https://art.milevski.co)
`;
}

// Main
const cvMarkdown = generateCV();
const tempMd = join(__dirname, "cv.generated.md");

// Write temp markdown
writeFileSync(tempMd, cvMarkdown);
console.log("Generated cv.generated.md");

// Convert to PDF using Pandoc + Typst
try {
  execSync(
    `pandoc "${tempMd}" -o "${join(OUTPUT_DIR, "cv.pdf")}" --pdf-engine=typst`,
    {
      stdio: "inherit",
    },
  );
  console.log("Generated public/cv.pdf");
} catch (error) {
  console.error("Failed to generate PDF:", error);
  process.exit(1);
}
