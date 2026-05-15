import { geoGraticule10, geoPath, GeoProjection } from "d3-geo";
import { geoBonne } from "d3-geo-projection";
import * as topojson from "topojson-client";
import fm from "front-matter";
import { marked } from "marked";

import "./style.css";

// ==========================================================================
// Types
// ==========================================================================
interface WorkProject {
  title: string;
  role: string;
  period: string;
  tags: string[];
  link: string | null;
  order: number;
  color: [string, string];
  icon: string;
  content: string;
  slug: string;
}

interface ArtAbout {
  title: string;
  shopLink: string;
  content: string;
}

interface ArtExhibitions {
  title: string;
  content: string;
}

interface ArtContent {
  about?: ArtAbout;
  exhibitions?: ArtExhibitions;
}

interface FrontMatterResult<T> {
  attributes: T;
  body: string;
}

// ==========================================================================
// Content Loading (from markdown files)
// ==========================================================================
const workFiles = import.meta.glob<string>("/content/work/*.md", {
  query: "?raw",
  import: "default",
});

const artFiles = import.meta.glob<string>("/content/art/*.md", {
  query: "?raw",
  import: "default",
});

async function loadContent(): Promise<{
  workProjects: WorkProject[];
  artContent: ArtContent;
}> {
  // Load work projects
  const workProjects: WorkProject[] = [];
  for (const path in workFiles) {
    const raw = await workFiles[path]();
    const { attributes, body } = fm<Omit<WorkProject, "content" | "slug">>(
      raw,
    ) as FrontMatterResult<Omit<WorkProject, "content" | "slug">>;
    workProjects.push({
      ...attributes,
      content: marked.parse(body) as string,
      slug: path.split("/").pop()!.replace(".md", ""),
    });
  }
  workProjects.sort((a, b) => a.order - b.order);

  // Load art content
  const artContent: ArtContent = {};
  for (const path in artFiles) {
    const raw = await artFiles[path]();
    const { attributes, body } = fm(raw);
    const key = path.split("/").pop()!.replace(".md", "") as
      | "about"
      | "exhibitions";
    artContent[key] = {
      ...(attributes as Record<string, string>),
      content: marked.parse(body) as string,
    } as ArtAbout | ArtExhibitions;
  }

  return { workProjects, artContent };
}

// ==========================================================================
// Render Functions
// ==========================================================================
function renderWorkCards(projects: WorkProject[]): void {
  const grid = document.querySelector(".work__grid");
  if (!grid) return;

  grid.innerHTML = projects
    .map(
      (project) => `
    <article class="card" data-project="${project.slug}">
      <div class="card__image" style="background: linear-gradient(135deg, ${project.color[0]} 0%, ${project.color[1]} 100%);">
        <span class="card__icon">${project.icon}</span>
      </div>
      <div class="card__content">
        <h3 class="card__title">${project.title}</h3>
        <p class="card__description">${project.content.split("</p>")[0].replace("<p>", "")}</p>
        <span class="card__role">${project.role}</span>
      </div>
    </article>
  `,
    )
    .join("");

  // Re-attach click handlers
  grid.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("click", () => {
      const project = projects.find(
        (p) => p.slug === (card as HTMLElement).dataset.project,
      );
      if (project) openModal(project);
    });
  });
}

function renderArtSection(artContent: ArtContent): void {
  const artIntro = document.querySelector(".art__intro");
  const artList = document.querySelector(".art__list");
  const artShopLink =
    document.querySelector<HTMLAnchorElement>(".art__shop-link");

  if (artIntro && artContent.about) {
    artIntro.innerHTML = artContent.about.content;
  }

  if (artList && artContent.exhibitions) {
    const listHtml = artContent.exhibitions.content;
    artList.innerHTML = listHtml
      .replace("<ul>", "")
      .replace("</ul>", "")
      .replace(/<li>/g, '<li class="art__list-item">')
      .trim();
  }

  if (artShopLink && artContent.about?.shopLink) {
    artShopLink.href = artContent.about.shopLink;
  }
}

// ==========================================================================
// Modal
// ==========================================================================
const modal = document.getElementById("modal");
const modalBody = document.getElementById("modal-body");
const modalClose = document.querySelector(".modal__close");
const modalBackdrop = document.querySelector(".modal__backdrop");

function openModal(project: WorkProject): void {
  if (!modalBody || !modal) return;

  modalBody.innerHTML = `
    <h3>${project.title}</h3>
    <p class="modal__period">${project.period}</p>
    <div class="modal__content">${project.content}</div>
    <div class="tags">
      ${project.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}
    </div>
    ${project.link ? `<a href="${project.link}" target="_blank" rel="noopener" class="link">Visit ${project.title.split(" ")[0]} →</a>` : ""}
  `;

  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeModal(): void {
  if (!modal) return;
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

modalClose?.addEventListener("click", closeModal);
modalBackdrop?.addEventListener("click", closeModal);

document.addEventListener("keydown", (e: KeyboardEvent) => {
  if (e.key === "Escape" && modal?.getAttribute("aria-hidden") === "false") {
    closeModal();
  }
});

// ==========================================================================
// Navigation
// ==========================================================================
const nav = document.querySelector(".nav");
const navToggle = document.querySelector(".nav__toggle");
const navLinks = document.querySelectorAll(".nav__link");

navToggle?.addEventListener("click", () => {
  if (!nav || !navToggle) return;
  const isOpen = nav.classList.toggle("nav--open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    nav?.classList.remove("nav--open");
    navToggle?.setAttribute("aria-expanded", "false");
  });
});

document.addEventListener("click", (e: MouseEvent) => {
  if (nav && !nav.contains(e.target as Node)) {
    nav.classList.remove("nav--open");
    navToggle?.setAttribute("aria-expanded", "false");
  }
});

// ==========================================================================
// Rotating Map Visualization
// ==========================================================================
const canvas = document.getElementById("map") as HTMLCanvasElement | null;

if (canvas) {
  fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/land-110m.json")
    .then((response) => response.json())
    .then((world) => {
      const land = topojson.feature(world, world.objects.land);
      const graticule = geoGraticule10();
      const outline = { type: "Sphere" as const };

      const width = canvas.offsetWidth * devicePixelRatio;
      const height = canvas.offsetHeight * devicePixelRatio;
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d")!;
      const projection = geoBonne()
        .parallel(18)
        .precision(0.5) as GeoProjection;

      projection.fitWidth(width, outline);
      canvas.style.height = "66%";

      const path = geoPath(projection, ctx);

      function render(): void {
        ctx.clearRect(0, 0, width, height);

        ctx.save();
        ctx.beginPath();
        path(outline);
        ctx.clip();
        ctx.fillStyle = "#E2DDC7";
        ctx.fillRect(0, 0, width, height);

        ctx.lineWidth = 1;
        ctx.beginPath();
        path(graticule);
        ctx.strokeStyle = "#aaa";
        ctx.stroke();
        ctx.beginPath();
        path(land);
        ctx.fillStyle = "#2e1c00";
        ctx.fill();
        ctx.restore();
        ctx.beginPath();
        path(outline);
        ctx.lineWidth = 8;
        ctx.strokeStyle = "#2e1c00";
        ctx.stroke();
      }

      let x = 0;
      let y = 0;
      const vx = 0.25;
      const vy = 0.05;

      function draw(): void {
        projection.rotate([(x += vx), (y += vy)]);
        render();
        requestAnimationFrame(draw);
      }
      requestAnimationFrame(draw);
    });
}

// ==========================================================================
// Initialize
// ==========================================================================
loadContent().then(({ workProjects, artContent }) => {
  renderWorkCards(workProjects);
  renderArtSection(artContent);
});
