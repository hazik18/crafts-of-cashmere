import { Product, CraftCategory } from '../../types';

export interface SpecItem {
  label: string;
  value: string;
}

export interface CareInstructions {
  cleaning: string;
  storage: string;
  preservation: string;
}

export interface ProductDetails {
  dimensions: string;
  weight: string;
  materials: string;
  technique: string;
  origin: string;
  loomTime: string;
  specs: SpecItem[];
  care: CareInstructions;
}

const CATEGORY_SPECS: Record<CraftCategory, (p: Product) => ProductDetails> = {
  pashmina: (p) => {
    const isStole = /stole|scarf|muffler/i.test(p.name);
    return {
      dimensions: p.dimensions || (isStole ? '200 cm × 70 cm (Stole)' : '200 cm × 100 cm (Full Shawl)'),
      weight: p.weight || '180 – 210 grams (Ultra-light ring grade)',
      materials: p.materials || '100% Raw Ladakhi Changthangi Cashmere (12.5–14.5 Micron)',
      technique: p.technique || 'Hand-spun on wooden Yinder · Woven on 4-pedal pit loom',
      origin: p.origin || 'Old City Atelier, Srinagar, Kashmir',
      loomTime: p.loomTime || '120 – 180 Hours on traditional wooden loom',
      specs: [
        { label: 'Fleece Grade', value: '100% Changthangi Capra Hircus Undercoat' },
        { label: 'Micron Fineness', value: '12.5 – 14.5 Microns (Official GI Grade)' },
        { label: 'Weave Structure', value: 'Diamond Twill (Chashm-e-Bulbul)' },
        { label: 'Artisan Provenance', value: p.maker || 'Master Weaver Guild, Srinagar' },
        { label: 'Purity Testing', value: 'Certified zero synthetic & polyester fibres' },
      ],
      care: {
        cleaning: 'Strictly professional dry clean with delicate wool solvents. Never wash in washing machines or wring.',
        storage: 'Store folded in unbleached, breathable muslin cloth with natural Himalayan cedarwood balls. Avoid direct plastic covers.',
        preservation: 'Do not spray perfumes or alcohol directly onto cashmere fleece. Cool steam iron over a protective muslin buffer cloth.',
      },
    };
  },

  kaani: (p) => ({
    dimensions: p.dimensions || '200 cm × 100 cm (Full Heirloom Wrap)',
    weight: p.weight || '230 – 275 grams',
    materials: p.materials || '100% Ladakhi Pashmina with dyed silk/cashmere tujis',
    technique: p.technique || 'Interlocking Twill Tapestry guided by coded rhythmic Talim script',
    origin: p.origin || 'Kanihama & Srinagar Ateliers, Kashmir',
    loomTime: p.loomTime || '6 to 14 Months of continuous artisan needlework',
    specs: [
      { label: 'Weave Tradition', value: 'Talim Coded Interlocking Weave (16th C.)' },
      { label: 'Bobbins Used', value: 'Up to 1,500 carved wooden tujis per piece' },
      { label: 'Back Surface', value: 'Flawless interlock with zero loose floating threads' },
      { label: 'Artisan Lineage', value: p.maker || 'Master Kaani Wafabaf' },
      { label: 'Certification', value: 'Govt. Registered GI Kashmiri Kaani' },
    ],
    care: {
      cleaning: 'Museum-grade delicate dry cleaning only. Inform the cleaner of fine interlocking weave construction.',
      storage: 'Keep flat or loosely rolled in acid-free archival tissue within a cedarwood keepsake box.',
      preservation: 'Aerate in gentle morning shade once every change of season. Keep completely shielded from damp humidity.',
    },
  }),

  walnut: (p) => ({
    dimensions: p.dimensions || '14" L × 8.5" W × 5.5" H (Artisan carved proportions)',
    weight: p.weight || '1.4 – 2.8 kg (Solid heartwood)',
    materials: p.materials || '100+ year-old seasoned root heartwood of Juglans Regia',
    technique: p.technique || 'Deep-relief undercut carving (Takshi) with Jali fretwork',
    origin: p.origin || 'Baramulla & Downtown Srinagar, Kashmir',
    loomTime: p.loomTime || '40 – 80 Hours of hand chiselling',
    specs: [
      { label: 'Timber Origin', value: 'Kashmiri Walnut (Juglans Regia, seasoned 3+ yrs)' },
      { label: 'Carving Depth', value: 'Deep undercut high relief (20–25mm 3D depth)' },
      { label: 'Motif Heritage', value: 'Chinar leaves, wild grapevines & geometric jali' },
      { label: 'Finish', value: 'Natural agate stone buffing · 100% varnish-free' },
      { label: 'Artisan Carver', value: p.maker || 'Master Woodcarver, Srinagar' },
    ],
    care: {
      cleaning: 'Dust gently using a dry, soft natural horsehair brush or lint-free microfiber cloth.',
      storage: 'Keep in an environment with stable indoor humidity (40–60%). Avoid placing directly beside heaters or radiators.',
      preservation: 'Nourish the seasoned wood once annually with a drop of pure cold-pressed walnut oil or natural beeswax.',
    },
  }),

  papier: (p) => ({
    dimensions: p.dimensions || 'Height: 30 – 35 cm · Base Diameter: 14 – 16 cm',
    weight: p.weight || '480 – 720 grams',
    materials: p.materials || 'Mashed cotton rag paper pulp (Sakhta), mineral pigments & 24K Gold Leaf',
    technique: p.technique || 'Hand-moulded Sakhta cast with squirrel-hair Naqashi brushwork',
    origin: p.origin || 'Zadibal Crafts Quarter, Srinagar, Kashmir',
    loomTime: p.loomTime || '3 to 5 Weeks of handcrafting & layered copal lacquering',
    specs: [
      { label: 'Pulp Base', value: 'Moulded cotton rag pulp & natural starch adhesive' },
      { label: 'Gilding', value: '24K genuine beaten gold foil accents' },
      { label: 'Pigments', value: 'Natural stone & vegetal mineral color formulations' },
      { label: 'Lacquering', value: 'Hand-rubbed amber copal tree lacquer (scratch-resistant)' },
      { label: 'Master Artist', value: p.maker || 'Naqashi Master, Zadibal' },
    ],
    care: {
      cleaning: 'Wipe with an ultra-soft, completely dry microfiber cloth.',
      storage: 'Display indoors in a dry area away from moist steam or direct splashing.',
      preservation: 'Never apply damp sponges, wet wipes, alcohol, or abrasive cleaning detergents. Protect from prolonged direct sunlight.',
    },
  }),

  carpet: (p) => ({
    dimensions: p.dimensions || '4 ft × 6 ft (120 cm × 180 cm Area Heirloom)',
    weight: p.weight || '4.5 – 6.5 kg',
    materials: p.materials || '100% Pure Mulberry Silk pile on mercerized cotton warp',
    technique: p.technique || 'Hand-knotted single Persian knotting (Kal Baffi)',
    origin: p.origin || 'Wazir Bagh & Narbal Ateliers, Kashmir',
    loomTime: p.loomTime || '12 to 18 Months on traditional vertical wooden loom',
    specs: [
      { label: 'Knot Count', value: '450 – 600 Knots Per Square Inch (KPSI)' },
      { label: 'Pile Density', value: '8 mm dense velvet sheen mulberry silk' },
      { label: 'Dye Quality', value: 'Vegetable & mineral extracts (madder root, walnut bark)' },
      { label: 'Selvedge Edging', value: 'Hand-braided silk kilim selvedge borders' },
      { label: 'Master Knotsman', value: p.maker || 'Kal Baffi Atelier, Srinagar' },
    ],
    care: {
      cleaning: 'Vacuum gently with suction-only nozzle in the direction of the silk pile. Do not use rotating beater bars.',
      storage: 'Roll pile inwards with breathable cotton wrapping and dry cedar chips if stored long-term.',
      preservation: 'Rotate 180° once every 6 months to ensure uniform ambient light exposure and natural wear.',
    },
  }),

  crewel: (p) => ({
    dimensions: p.dimensions || '200 cm × 140 cm (Tapestry Throw) / 45 cm × 45 cm (Cushion)',
    weight: p.weight || '850 – 1,150 grams',
    materials: p.materials || '100% 2-Ply Worsted Wool on Hand-loomed Cotton Dasoot Canvas',
    technique: p.technique || 'Hand-hooked Aari chain stitch embroidery',
    origin: p.origin || 'Anantnag & Downtown Srinagar, Kashmir',
    loomTime: p.loomTime || '45 – 80 Hours of hand-hooked needlework',
    specs: [
      { label: 'Base Cloth', value: 'Handloom unbleached heavy cotton canvas (Dasoot)' },
      { label: 'Embroidery Yarn', value: '100% pure worsted wool dyed in heritage palettes' },
      { label: 'Needle Technique', value: 'Flowing continuous chain loop (Aari Needle)' },
      { label: 'Motif Imagery', value: 'Kashmiri Chinar, Iris, and floral vines' },
      { label: 'Craftsperson', value: p.maker || 'Aari Artisan Guild, Anantnag' },
    ],
    care: {
      cleaning: 'Professional dry cleaning recommended for longevity and color vibrancy.',
      storage: 'Store folded with acid-free tissue paper inside clean cotton storage bags.',
      preservation: 'Do not pull loose threads. Snip carefully with sharp curved embroidery scissors.',
    },
  }),
};

export function getProductDetails(product: Product): ProductDetails {
  const generator = CATEGORY_SPECS[product.cat] || CATEGORY_SPECS.pashmina;
  return generator(product);
}

