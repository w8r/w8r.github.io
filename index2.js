import {
  scaleLinear,
  json as loadJson,
  geoMercator
} from 'd3';
import reglWrap from 'regl';
import * as topojson from 'topojson-client';
import { geoBonne } from 'd3-geo-projection';
import { simplify, presimplify } from 'topojson-simplify';

const regl = reglWrap(document.body);

// The default us-atlas topojson size is 960x600.  If we wanted to dynamically compute the bounds
// of this we could loop through every point in the geometry and get the extent. See
// https://github.com/topojson/us-atlas#us/10m.json for details.
const width = document.documentElement.clientWidth;
const height = document.documentElement.clientHeight;

const x = scaleLinear()
  .range([-1, 1])
  .domain([0, width])

const y = scaleLinear()
  .range([1, -1])
  .domain([0, height])


// You can't actually tweak this on many environments.  Drawing thick lines with
// webgl is much more complex.  See https://github.com/jpweeks/regl-line-builder for a
// convenient API
const lineWidth = 1;

const drawLines = regl({
  frag: `
    precision mediump float;
    uniform vec4 color;
    void main() {
      gl_FragColor = color;
    }`,

  vert: `
    precision mediump float;
    attribute vec2 position;
    uniform float uShift;
    void main() {
      gl_Position = vec4(position + vec2(uShift), 0, 1);
    }`,

  attributes: {
    position: (context, props) => {
      return props.positions
    }
  },

  elements: (context, props) => {
    return props.elements
  },

  uniforms: {
    color: [0.13, 0.13, 0.13, 1],
    uShift: ({ tick }) => tick / 1000
  },

  lineWidth
})

/* eslint-disable github/no-then */
loadJson('https://unpkg.com/world-atlas@1/world/110m.json').then(world => {

  console.log(topojson);

  // world = presimplify(world);
  // world = simplify(world, 0.5);

  // const landSvg = svg.insert('path', '.graticule')
  //     .datum(topojson.feature(world, world.objects.land))
  //     .attr('class', 'land')
  //     .attr('d', path);


  const land     = topojson.feature(world, world.objects.land);
  const boundary = topojson.mesh(world, world.objects.countries, (a, b) => a !== b);

  const usMesh = topojson.mesh(world)

  regl.clear({
    color: [1, 0.98, 0.84375, 1],
    depth: 1
  });

  const cprojection = geoBonne()
      .center([0, 22])
      .parallel(17.5)
      //.scale(1000)
      //.scale(250)
      //.translate([cw / 2, ch / 2]);



  const vCount = usMesh.coordinates.reduce((acc, m) => acc + m.length, 0);
  const positions = [], indexes = [];

  const merc = geoMercator().translate([width / 2, height / 2]);

  let cnt = 0;
  for (const mesh of usMesh.coordinates) {
    for (let i = 0; i < mesh.length; i++) {
      // Map xy points to the webgl coordinate system
      const d = cprojection(mesh[i]);
      positions.push([x(d[0]), y(d[1])]);

      //positions.push(cprojection(d));

      // Build a list of indexes that map to the positions array
      // [[0, 1], [1, 2], ...]
      if (i + 1 < mesh.length) indexes.push([cnt + i, cnt + i + 1]);
    }
    cnt += mesh.length;
  }

  const elements = regl.elements({
    primitive: 'lines',
    data: indexes
  });

  regl.frame(({ tick }) => {
    regl.clear({
      color: [1, 0.98, 0.84375, 1],
      depth: 1
    })
    drawLines({ elements, positions });
  });
})
