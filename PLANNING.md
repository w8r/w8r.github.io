# Portfolio Website Redesign Plan

## Vision
Transform milevski.co into a modern, minimalist professional portfolio using Vue.js. Preserve the signature rotating Bonne projection map over the 16th-century book graphic.

## Design Decisions

| Element | Choice |
|---------|--------|
| Framework | Vue 3 + Vue Router (minimal, no Vuex needed for static site) |
| Map placement | Hero focal point |
| Navigation | Minimal hamburger menu |
| Layout | Single page with smooth scroll |
| Work display | Grid of cards |
| Color palette | Keep warm cream/brown (#E2DDC7, #2E1C00) |
| Typography | Upgrade to modern readable font (Inter or similar) |

## Site Structure

```
┌─────────────────────────────────────────────────┐
│  HERO                                           │
│  - Rotating Bonne map on book graphic           │
│  - Name + tagline                               │
│  - Scroll indicator                             │
├─────────────────────────────────────────────────┤
│  ABOUT                                          │
│  - Brief bio (2-3 sentences)                    │
│  - Social links + CV download                   │
├─────────────────────────────────────────────────┤
│  WORK (card grid)                               │
│  - Ogma/Linkurious                              │
│  - Wikimapia                                    │
│  - Open Source libraries                        │
│  - (others TBD)                                 │
├─────────────────────────────────────────────────┤
│  ART & EXHIBITIONS                              │
│  - Link to art shop (art.milevski.co)           │
│  - Exhibition history                           │
│  - Gallery (content TBD)                        │
├─────────────────────────────────────────────────┤
│  FOOTER                                         │
│  - Contact info                                 │
│  - Social icons                                 │
└─────────────────────────────────────────────────┘
```

## Portfolio Projects (from CV)

### Primary (for cards)
1. **Ogma @ Linkurious** (2016-present)
   - Graph visualization library
   - Graph drawing algorithms, spatial indexing
   - Lead R&D, team of 3
   - Link: linkurious.com

2. **Wikimapia** (2009-2014)
   - Collaborative interactive map, 1.2M daily visitors
   - Built OpenLayers-like map engine from scratch
   - Front-end lead
   - Link: wikimapia.org

3. **Open Source Libraries**
   - avl (119⭐) - Fast AVL tree implementation
   - bezier-intersect (45⭐) - Bezier curve intersection algorithms
   - bresenham-zingl (27⭐) - Efficient Bresenham rasterizers
   - esri-leaflet-legend (25⭐) - Esri Leaflet plugin
   - GitHub: github.com/w8r

4. **eVision GIS** (2014-2016)
   - Industrial GIS for oil & gas (EPTW software)
   - ArcGIS/Geoserver interoperability
   - 2D spatial viewers/editors

### Secondary (list or smaller cards)
- Dream Industries (Bookmate, Zvooq)
- Freelance architectural/design projects

## Art Section

### Exhibitions
- Students art exhibition, CHA, Moscow, 2008
- Students art exhibition, CHA, Moscow, 2007
- "Artist's Book" (book-art), Modern Arts Museum, Moscow, 2005
- Non-Fiction-2004 (book-art), CHA, Moscow, 2004

### Links
- Art shop: https://art.milevski.co (Payhip)

### Content needed
- [ ] Exhibition photos/documentation
- [ ] Artwork images for gallery
- [ ] Descriptions for pieces

## CV Redesign

### Format
- LaTeX for professional typography
- PDF output hosted on site
- Modern, minimal template

### Updates needed
- [ ] Update date range for Linkurious (2016-2025)
- [ ] Refresh skills section (add modern tooling)
- [ ] Clean up formatting and hierarchy
- [ ] Consider removing outdated contact methods (Skype/GTalk)

## Technical Implementation

### Phase 0: Mockup & Iteration
- [ ] Move existing index.html to /old for comparison
- [ ] Create minimal HTML/CSS mockup (no framework yet)
- [ ] Iterate on layout and typography
- [ ] Finalize design before adding Vue

### Phase 1: Vue Setup
- [ ] Add Vue 3 + Vite plugin
- [ ] Set up component structure
- [ ] Port rotating map to Vue component

### Phase 2: Layout & Components
- [ ] Hero component with map
- [ ] Navigation (hamburger menu)
- [ ] About section
- [ ] Project card component + detail modal
- [ ] Work grid section
- [ ] Art section (placeholder)
- [ ] Footer

### Phase 3: Content & Polish
- [ ] Add project content and images
- [ ] Responsive design refinement
- [ ] Smooth scroll behavior
- [ ] Animations/transitions
- [ ] Performance optimization

### Phase 4: CV (LaTeX)
- [ ] Create template (modern minimal + serif typography)
- [ ] Build CV content
- [ ] Set up build pipeline for PDF

## Assets Needed

### Images
- [ ] Project thumbnails/screenshots
  - Ogma demo screenshot
  - Wikimapia screenshot
  - Open source project visuals
- [ ] Art/exhibition photos

### Existing (keep)
- bouffon-min.jpg (book graphic)
- favicon.ico
- fontello icons (or replace with modern icon set)

## Open Questions
- Which GitHub repos to highlight?
- What thumbnail images for each project?
- Art gallery: masonry layout or uniform grid?
- Should project cards link to detail pages or external sites?
