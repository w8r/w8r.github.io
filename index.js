const height = document.documentElement.clientHeight;
const width  = document.documentElement.clientWidth - 30;
const imageUrl = 'bouffon.jpg';

const projection = d3.geoBonne()
    .center([0, 27])
    .parallel(15)
    .scale(60)
    .translate([width / 2, height / 2])
    .precision(0.2);

const path = d3.geoPath()
    .projection(projection);

const graticule = d3.geoGraticule();
var canvas, ctx, cw, cx, cpath, cprojection,
    world, land, boundary;


// Given a 4x4 perspective transformation matrix, and a 2D point (a 2x1 vector),
// applies the transformation matrix by converting the point to homogeneous
// coordinates at z=0, post-multiplying, and then applying a perspective divide.
function project(m, p) {
  p = multiply(m, [p[0], p[1], 0, 1]);
  return [p[0] / p[3], p[1] / p[3]];
}

// Post-multiply a 4x4 matrix in column-major order by a 4x1 column vector:
// [ m0 m4 m8  m12 ]   [ v0 ]   [ x ]
// [ m1 m5 m9  m13 ] * [ v1 ] = [ y ]
// [ m2 m6 m10 m14 ]   [ v2 ]   [ z ]
// [ m3 m7 m11 m15 ]   [ v3 ]   [ w ]
function multiply(m, v) {
  return [
    m[0] * v[0] + m[4] * v[1] + m[8 ] * v[2] + m[12] * v[3],
    m[1] * v[0] + m[5] * v[1] + m[9 ] * v[2] + m[13] * v[3],
    m[2] * v[0] + m[6] * v[1] + m[10] * v[2] + m[14] * v[3],
    m[3] * v[0] + m[7] * v[1] + m[11] * v[2] + m[15] * v[3]
  ];
}


const img = new Image();
img.onload = () => {
  const { naturalWidth, naturalHeight } = img;
  const imageWidth = Math.min(width, naturalWidth);
  const imageHeight = naturalHeight * (naturalWidth / imageWidth);
  const background = d3.select('body')
    .insert('div', '.map')
    .classed('fool', true)
    .style('background-image', `url(${imageUrl})`)
    .style('width',  imageWidth + 'px')
    .style('height', imageHeight + 'px');

  cw = imageWidth * 2; ch = imageHeight * 2;
  canvas = background
      .append('canvas')
      .classed('map', true)
      .attr('width', cw)
      .attr('height', ch)
      .style('width', cw / 2 + 'px')
      .style('height', ch / 2 + 'px');


  cprojection = d3.geoBonne()
      .center([0, 27])
      .parallel(17)
      .scale(220)
      .translate([cw / 2, ch / 2 - 270])
      //.fitSize([cw, ch])
      .precision(1);

  ctx = canvas.node().getContext('2d');
  ctx.lineJoin = 'round';
  ctx.lineCap  = 'round';

  cpath = d3.geoPath()
    .projection(cprojection)
    .context(ctx);
};
img.src = imageUrl;


const svg = d3.select('body').append('svg')
    .attr('width', width)
    .attr('height', height);

svg.append('defs').append('path')
    .datum({type: 'Sphere'})
    .attr('id', 'sphere')
    .attr('d', path);

svg.append('use')
    .attr('class', 'stroke')
    .attr('xlink:href', '#sphere');

svg.append('use')
    .attr('class', 'fill')
    .attr('xlink:href', '#sphere');

const graticuleSvg = svg.append('path')
    .datum(graticule)
    .attr('class', 'graticule')
    .attr('d', path);


d3.json('world-50m.json', (error, data) => {
  if (error) throw error;

  world = topojson.presimplify(data);
  world = topojson.simplify(world, 0.5);

  const landSvg = svg.insert('path', '.graticule')
      .datum(topojson.feature(world, world.objects.land))
      .attr('class', 'land')
      .attr('d', path);


  land     = topojson.feature(world, world.objects.land);
  boundary = topojson.mesh(world, world.objects.countries, (a, b) => a !== b);

  const velocity = 0.02;

  const svgBoundary = svg.insert('path', '.graticule')
      .datum(boundary)
      .attr('class', 'boundary')
      .attr('d', path);


  d3.timer((elapsed) => {
    if (!ctx) return;
    ctx.clearRect(0, 0, cw, ch);

    cprojection.rotate([velocity * elapsed, 0]);

    ctx.beginPath();
    cpath(graticule.outline());
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#FFFDD8';
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    cpath(land);
    ctx.fillStyle = '#222222';
    ctx.fill();

    ctx.beginPath();
    cpath(boundary);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    cpath(graticule());
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 0.2;
    ctx.stroke();
  });
});
