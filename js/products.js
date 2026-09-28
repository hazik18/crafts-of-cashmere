/* ============================================================
   VÁLLEY — product data & generative SVG artwork
   Each craft gets a hand-drawn motif rendered as inline SVG,
   so the site ships beautiful visuals with zero image assets.
   ============================================================ */

const PALETTES = {
  pashmina:  { a: '#EFE6D8', b: '#D9C7A9', c: '#A67C3D', d: '#6E5A3E' },
  kaani:     { a: '#E8DFD2', b: '#B85C48', c: '#A67C3D', d: '#3E4A5A' },
  walnut:    { a: '#EDE4D6', b: '#8A6A4F', c: '#5C4433', d: '#3A2C22' },
  papier:    { a: '#F0E7DA', b: '#2E4A62', c: '#B85C48', d: '#A67C3D' },
  carpet:    { a: '#EAE0D0', b: '#8A3B3B', c: '#3E4A5A', d: '#A67C3D' },
  crewel:    { a: '#EFE8DC', b: '#5A6E4E', c: '#B85C48', d: '#A67C3D' },
};

/* --- motif builders — each returns inner SVG markup --- */

function paisley(p, id) {
  return `
    <defs><linearGradient id="g${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${p.a}"/><stop offset="1" stop-color="${p.b}" stop-opacity="0.55"/>
    </linearGradient></defs>
    <rect width="300" height="400" fill="url(#g${id})"/>
    <g fill="none" stroke="${p.d}" stroke-width="2">
      <path d="M150 70 C215 105 225 195 178 255 C150 290 105 285 92 250 C80 216 102 182 135 188 C158 192 168 216 152 232"/>
      <path d="M150 95 C198 122 206 190 170 238" stroke="${p.c}" stroke-width="1.2" stroke-dasharray="1 6" stroke-linecap="round"/>
    </g>
    <g fill="${p.c}">
      <circle cx="150" cy="70" r="3.5"/><circle cx="92" cy="250" r="2.5"/>
      <circle cx="152" cy="232" r="3"/>
    </g>
    <g fill="none" stroke="${p.c}" stroke-width="1">
      <path d="M60 330 q20 -18 40 0 q20 18 40 0 q20 -18 40 0 q20 18 40 0"/>
    </g>`;
}

function chinarLeaf(p, id) {
  return `
    <defs><linearGradient id="g${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${p.a}"/><stop offset="1" stop-color="${p.b}" stop-opacity="0.45"/>
    </linearGradient></defs>
    <rect width="300" height="400" fill="url(#g${id})"/>
    <g fill="none" stroke="${p.c}" stroke-width="2" stroke-linejoin="round">
      <path d="M150 90 L163 150 L215 128 L178 175 L235 195 L175 200 L195 260 L150 215 L105 260 L125 200 L65 195 L122 175 L85 128 L137 150 Z"/>
      <path d="M150 215 L150 320" stroke-width="1.5"/>
      <path d="M150 250 q-16 10 -28 4 M150 280 q16 10 28 4" stroke-width="1"/>
    </g>
    <circle cx="150" cy="90" r="3" fill="${p.d}"/>`;
}

function latticeJali(p, id) {
  let cells = '';
  for (let y = 0; y < 5; y++)
    for (let x = 0; x < 4; x++) {
      const cx = 60 + x * 60, cy = 80 + y * 60;
      cells += `<path d="M${cx} ${cy - 22} L${cx + 18} ${cy} L${cx} ${cy + 22} L${cx - 18} ${cy} Z" fill="none" stroke="${p.c}" stroke-width="1.4"/>
                <circle cx="${cx}" cy="${cy}" r="3.5" fill="${p.b}"/>`;
    }
  return `
    <defs><linearGradient id="g${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${p.a}"/><stop offset="1" stop-color="${p.b}" stop-opacity="0.35"/>
    </linearGradient></defs>
    <rect width="300" height="400" fill="url(#g${id})"/>${cells}`;
}

function medallion(p, id) {
  return `
    <defs><radialGradient id="g${id}" cx="0.5" cy="0.45" r="0.8">
      <stop offset="0" stop-color="${p.a}"/><stop offset="1" stop-color="${p.b}" stop-opacity="0.4"/>
    </radialGradient></defs>
    <rect width="300" height="400" fill="url(#g${id})"/>
    <g fill="none" stroke="${p.b}" stroke-width="1.6">
      <circle cx="150" cy="190" r="85"/>
      <circle cx="150" cy="190" r="62" stroke="${p.c}" stroke-dasharray="2 7" stroke-linecap="round"/>
      <circle cx="150" cy="190" r="30" stroke="${p.d}"/>
    </g>
    <g fill="${p.c}">
      ${[0,45,90,135,180,225,270,315].map(a => {
        const r = (a * Math.PI) / 180;
        return `<circle cx="${150 + Math.cos(r) * 85}" cy="${190 + Math.sin(r) * 85}" r="3"/>`;
      }).join('')}
    </g>
    <path d="M150 160 q22 30 0 60 q-22 -30 0 -60 Z" fill="${p.b}"/>
    <rect x="40" y="330" width="220" height="1.5" fill="${p.d}"/>
    <rect x="60" y="340" width="180" height="1" fill="${p.c}"/>`;
}

function vineBloom(p, id) {
  return `
    <defs><linearGradient id="g${id}" x1="0" y1="1" x2="1" y2="0">
      <stop offset="0" stop-color="${p.a}"/><stop offset="1" stop-color="${p.b}" stop-opacity="0.35"/>
    </linearGradient></defs>
    <rect width="300" height="400" fill="url(#g${id})"/>
    <g fill="none" stroke="${p.b}" stroke-width="1.8" stroke-linecap="round">
      <path d="M150 340 C120 280 185 245 155 190 C130 145 175 110 150 70"/>
      <path d="M150 265 q-38 -8 -48 -42 M152 200 q38 -8 48 -42 M150 130 q-34 -6 -44 -38"/>
    </g>
    <g fill="${p.c}">
      <circle cx="102" cy="223" r="8"/><circle cx="200" cy="158" r="8"/><circle cx="106" cy="92" r="8"/>
      <circle cx="150" cy="70" r="10" fill="${p.b}"/>
    </g>
    <g fill="${p.a}">
      <circle cx="102" cy="223" r="3"/><circle cx="200" cy="158" r="3"/><circle cx="106" cy="92" r="3"/>
    </g>`;
}

function boxRosette(p, id) {
  return `
    <defs><linearGradient id="g${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${p.a}"/><stop offset="1" stop-color="${p.b}" stop-opacity="0.4"/>
    </linearGradient></defs>
    <rect width="300" height="400" fill="url(#g${id})"/>
    <rect x="70" y="110" width="160" height="160" rx="6" fill="none" stroke="${p.b}" stroke-width="2"/>
    <rect x="84" y="124" width="132" height="132" rx="4" fill="none" stroke="${p.c}" stroke-width="1" stroke-dasharray="2 6" stroke-linecap="round"/>
    <g fill="none" stroke="${p.d}" stroke-width="1.6">
      ${[0,60,120,180,240,300].map(a => {
        const r = (a * Math.PI) / 180;
        return `<ellipse cx="${150 + Math.cos(r) * 26}" cy="${190 + Math.sin(r) * 26}" rx="13" ry="7" transform="rotate(${a} ${150 + Math.cos(r) * 26} ${190 + Math.sin(r) * 26})"/>`;
      }).join('')}
    </g>
    <circle cx="150" cy="190" r="7" fill="${p.c}"/>
    <path d="M110 310 q40 -20 80 0" fill="none" stroke="${p.c}" stroke-width="1.2"/>`;
}

const MOTIFS = { paisley, chinarLeaf, latticeJali, medallion, vineBloom, boxRosette };

function artSVG(motif, paletteKey, uid) {
  const p = PALETTES[paletteKey];
  return `<svg viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">${MOTIFS[motif](p, uid)}</svg>`;
}

/* --- collections --- */
const COLLECTIONS = [
  { id: 'pashmina', name: 'Pashmina Shawls', motif: 'paisley', palette: 'pashmina',
    img: 'images/pashmina-red.jpg', alt: 'Woman wrapped in a deep red pashmina shawl',
    desc: 'Hand-spun cashmere from Changthangi goats, softer than anything a machine can make.' },
  { id: 'kaani', name: 'Kaani Shawls', motif: 'vineBloom', palette: 'kaani',
    img: 'images/kaani-floral.jpg', alt: 'Woman wearing a red and white floral woven shawl',
    desc: 'Woven twig by twig from a coded talim — the haute couture of the loom.' },
  { id: 'walnut', name: 'Walnut Wood Carving', motif: 'chinarLeaf', palette: 'walnut',
    img: 'images/wood-chisel.jpg', alt: 'Artisan carving wood with a chisel',
    desc: 'Deep-relief chinar leaves and vines, chiselled from hundred-year-old walnut.' },
  { id: 'papier', name: 'Papier-Mâché', motif: 'boxRosette', palette: 'papier',
    img: 'images/papier-vases.jpg', alt: 'Colorful hand-painted vases with floral patterns',
    desc: 'Sakhta and naqashi — pulp shaped, lacquered and painted with squirrel-hair brushes.' },
  { id: 'carpet', name: 'Hand-Knotted Carpets', motif: 'medallion', palette: 'carpet',
    img: 'images/carpet-red.jpg', alt: 'Red hand-knotted carpet with intricate design',
    desc: 'Silk and wool kal baffi, up to 900 knots per square inch, made to outlive us.' },
  { id: 'crewel', name: 'Crewel & Chain Stitch', motif: 'latticeJali', palette: 'crewel',
    img: 'images/papier-ornament.jpg', alt: 'Hands embroidering colorful thread on dark fabric in a hoop',
    desc: 'Wool-embroidered drapery and namda rugs, hooked in flowing aari stitch.' },
];

/* --- catalog: six crafts × 20 pieces each ---
   Visuals cycle through real photographs and generative motif
   artwork so every tab feels stocked without repeating imagery. */

const MOTIF_KEYS = ['paisley', 'vineBloom', 'chinarLeaf', 'boxRosette', 'medallion', 'latticeJali'];

const CATALOG_DEF = {
  pashmina: {
    label: 'Pashmina',
    photos: [
      { src: 'images/pashmina-woman.jpg', alt: 'Woman wearing a red and black patterned shawl' },
      { src: 'images/pashmina-red.jpg', alt: 'Woman wrapped in a deep red pashmina shawl' },
      { src: 'images/scarves-railing.jpg', alt: 'Colorful scarves draped on a carved stone railing' },
      { src: 'images/scarves-multi.jpg', alt: 'Assorted colorful handwoven wraps' },
    ],
    makers: ['Woven by Fatima Bano', 'Woven by Bashir Ahmad', 'Dyed by Noor Din', 'Woven by Haleema Begum', 'Loom of Kanihama'],
    badges: ['GI Certified', 'Hand-Spun', 'Natural Dyes', 'New'],
    price: [9200, 34500],
    names: ['Heirloom Ring Shawl', 'Ivory Diamond-Weave Stole', 'Charcoal Herringbone Wrap', 'Zari-Border Pashmina',
      'Saffron Ombré Stole', 'Midnight Solid Pashmina', 'Chashm-e-Bulbul Weave', 'Kingri Border Shawl',
      'Dorukha Reversible Wrap', 'Hand-Spun Gossamer Stole', 'Walnut-Dyed Pashmina', 'Chinar Red Wrap',
      'Dushala Heritage Shawl', 'Kani Palla Stole', 'Pearl Grey Twill Shawl', 'Indigo Check Stole',
      'Rose Madder Wrap', 'Natural Ecru Shawl', 'Swarna Zari Pashmina', 'Bridal Sozni Shawl'],
  },
  kaani: {
    label: 'Kaani',
    photos: [
      { src: 'images/kaani-floral.jpg', alt: 'Woman wearing a red and white floral woven shawl' },
      { src: 'images/kaani-pink.jpg', alt: 'Woman wearing a soft pink woven shawl' },
    ],
    makers: ['Loom of Kanihama', 'Atelier of Ghulam Nabi', 'Woven by Bashir Ahmad', 'Woven by Haleema Begum'],
    badges: ['18 Months', 'Talim Coded', 'GI Certified', 'Dorukha'],
    price: [28000, 96000],
    names: ['Gulab Bagh Kaani', 'Chinar Boteh Kaani', 'Shalimar Garden Shawl', 'Nishat Palla Kaani',
      'Paisley Talim Stole', 'Char Bagh Dorukha', 'Mughal Vine Kaani', 'Saffron Field Palla',
      'Dal Mist Kaani', 'Pamposh Lotus Shawl', 'Zeen Kaani Stole', 'Heritage Talim Wrap',
      'Kanihama Masterpiece', 'Badam Boteh Kaani', 'Gulkar Border Shawl', 'Emerald Vale Kaani',
      'Rose Trellis Palla', 'Autumn Chinar Kaani', 'Royal Court Dorukha', 'Jamawar Revival Shawl'],
  },
  walnut: {
    label: 'Wood Carving',
    photos: [
      { src: 'images/wood-chisel.jpg', alt: 'Artisan carving wood with a chisel' },
      { src: 'images/wood-tool.jpg', alt: 'Hand holding a wooden carving tool over carved wood' },
    ],
    makers: ['Carved by Ali Mohammad', 'Carved by Abdul Rashid', 'Atelier of Ghulam Nabi'],
    badges: ['Walnut', 'Deep Relief', 'Single Block', 'Hand-Chiselled'],
    price: [2400, 18500],
    names: ['Chinar Jewel Box', 'Carved Rehal Book Stand', 'Paisley Relief Tray', 'Grape Vine Mirror Frame',
      'Chinar Leaf Coasters', 'Deep-Relief Fruit Bowl', 'Lattice Jali Screen Panel', 'Carved Photo Frame',
      'Walnut Serving Platter', 'Rose Carved Trinket Box', 'Wazwan Serving Bowl', 'Carved Book Rest',
      'Chinar Canopy Wall Panel', 'Vine & Bloom Tea Tray', 'Hexagon Jali Box', 'Carved Candle Stands',
      'Walnut Letter Rack', 'Shikara Model Carving', 'Pinjrakari Lattice Frame', "Master Carver's Chest"],
  },
  papier: {
    label: 'Papier-Mâché',
    photos: [
      { src: 'images/papier-vases.jpg', alt: 'Colorful hand-painted vases with floral patterns' },
      { src: 'images/papier-teapots.jpg', alt: 'Colorful hand-painted teapots and plates at a market' },
      { src: 'images/papier-ornament.jpg', alt: 'Hand-painted ornament with fine floral detail' },
    ],
    makers: ['Painted by Maqbool Jan', 'Painted by Shabir Hussain', 'Atelier of Ghulam Nabi'],
    badges: ['Naqashi', 'Gold Leaf', 'Hand-Painted', 'Sakhta'],
    price: [1200, 9200],
    names: ['Naqashi Vase', 'Gulkar Qalamdan Pen Case', 'Hazara Bowl', 'Almond Blossom Box',
      'Gold Leaf Ornament Set', 'Chinar Motif Plate', 'Sakhta Jewellery Box', 'Miniature Samovar',
      'Naqashi Wall Plate', 'Paisley Trinket Bowl', 'Hand-Painted Coaster Set', 'Blue Iris Vase',
      'Kar-i-Qalamdani Case', 'Zoon Moon Box', 'Badam Vari Bowl', 'Gulab Naqashi Urn',
      'Festive Bauble Set', 'Marbled Lacquer Tray', 'Saffron Bloom Casket', 'Heritage Naqashi Lamp'],
  },
  carpet: {
    label: 'Carpets',
    photos: [
      { src: 'images/carpet-red.jpg', alt: 'Red hand-knotted carpet with intricate design' },
      { src: 'images/carpet-colorful.jpg', alt: 'Large rug with many colors and intricate designs' },
    ],
    makers: ['Knotted in Srinagar', 'Knotted by Wali Mohammad', 'Atelier of Ghulam Nabi'],
    badges: ['576 kpsi', '900 kpsi', 'Silk', 'Wool & Silk'],
    price: [45000, 260000],
    names: ['Ardabil Medallion Rug', 'Tree of Life Silk Rug', 'Kashan Garden Carpet', 'Chinar Vale Runner',
      'Gul Paisley Area Rug', 'Mihrab Prayer Rug', 'Silk-on-Silk Medallion', 'Wool Kal Baffi Rug',
      'Crimson Court Carpet', 'Ivory Garden Runner', 'Hamadan Border Rug', 'Pamposh Silk Rug',
      'Nine-Medallion Carpet', 'Indigo Field Rug', 'Walnut Border Runner', 'Heritage Talim Carpet',
      'Emerald Mihrab Rug', 'Rose Field Silk Rug', 'Charbagh Carpet', 'Museum Replica Rug'],
  },
  crewel: {
    label: 'Crewel & Namda',
    photos: [
      { src: 'images/crewel-flowers.jpg', alt: 'Flower embroidery in colorful thread on fabric' },
      { src: 'images/crewel-cloth.jpg', alt: 'Crewel embroidered fabric in flowing wool stitch' },
      { src: 'images/threads.jpg', alt: 'Spools of colorful embroidery thread' },
    ],
    makers: ['Stitched by Zooni Collective', 'Stitched by Mehmooda Akhtar', 'Atelier of Ghulam Nabi'],
    badges: ['Hand-Embroidered', 'Aari Stitch', 'Namda', 'Wool'],
    price: [3000, 15500],
    names: ['Crewel Throw', 'Chinar Crewel Drape', 'Namda Wool Rug', 'Aari Bloom Cushions',
      'Jacobean Vine Curtain', 'Chain-Stitch Wall Art', 'Gabba Folk Rug', 'Crewel Bolster Cover',
      'Wildflower Bedspread', 'Aari Table Runner', 'Paisley Crewel Panel', 'Blossom Chair Pad Set',
      'Crewel Carry Tote', 'Meadow Chain-Stitch Rug', 'Iris Cushion Cover', 'Vine Lattice Drape',
      'Heritage Namda', 'Rose Garden Throw', 'Sozni Sampler Frame', 'Bagh Panel Curtain'],
  },
};

function buildCatalog() {
  const catalog = {};
  Object.entries(CATALOG_DEF).forEach(([key, def]) => {
    const [min, max] = def.price;
    catalog[key] = {
      label: def.label,
      items: def.names.map((name, i) => {
        // deterministic spread of prices, makers, badges and visuals
        const price = Math.round((min + ((i * 7919) % 997) / 997 * (max - min)) / 100) * 100;
        const visualIdx = i % (def.photos.length + MOTIF_KEYS.length);
        const photo = visualIdx < def.photos.length ? def.photos[visualIdx] : null;
        return {
          id: `${key}-${String(i + 1).padStart(2, '0')}`,
          cat: key,
          name,
          maker: def.makers[i % def.makers.length],
          badge: def.badges[i % def.badges.length],
          price,
          img: photo ? photo.src : null,
          alt: photo ? photo.alt : `${name} — hand-drawn ${def.label} motif artwork`,
          motif: photo ? null : MOTIF_KEYS[(visualIdx - def.photos.length + i) % MOTIF_KEYS.length],
        };
      }),
    };
  });
  return catalog;
}

/* mutable: main.js replaces these with the live API catalog when the
   Node server is running; the generated set is the static fallback */
let CATALOG = buildCatalog();
let PRODUCTS = Object.values(CATALOG).flatMap((c) => c.items);

const AUTHENTIC_MARK = 'Handmade · Authentic';

const formatINR = (n) => '₹' + n.toLocaleString('en-IN');
