import { geoGraticule10, geoPath } from "d3-geo";
import { geoBonne } from "d3-geo-projection";
import * as topojson from "topojson-client";

const mail = document.querySelector<HTMLSpanElement>(".mail-content")!;
mail.innerHTML = mail.innerHTML.replace("spam", "alex");

const canvas = document.getElementById("map") as HTMLCanvasElement;

fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/land-110m.json")
  .then((response) => response.json())
  .then((world) => {
    const land = topojson.feature(world, world.objects.land);
    const graticule = geoGraticule10();
    const outline = { type: "Sphere" };

    const width = canvas.offsetWidth * devicePixelRatio;
    const height = canvas.offsetHeight * devicePixelRatio;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d")!;
    const projection = geoBonne().parallel(18).precision(0.5);

    projection.fitWidth(width, outline);
    canvas.style.height = "66%";

    const path = geoPath(projection, ctx);

    function render() {
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
      ctx.fillStyle = "#2E1C00";
      ctx.fill();
      ctx.restore();
      ctx.beginPath();
      path(outline);
      ctx.lineWidth = 8;
      ctx.strokeStyle = "#2E1C00";
      ctx.stroke();
    }

    let x = 0,
      y = 0;
    const vx = 0.25;
    const vy = 0.05;
    function draw() {
      projection.rotate([(x += vx), (y += vy)]);
      render();
      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  });
