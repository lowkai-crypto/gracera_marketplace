// 120 placeholder brand marks for the admin logo picker
// (admin/settings/branding/logo) -- no image-generation tool is available
// here, so these are hand-authored SVG glyphs, not renders. Each glyph
// assumes a 16x16 viewBox drawn in white over a colored/gradient
// rounded-square background (matching the existing default mark's look in
// apps/web/src/app/page.tsx). `null` (not a candidate here) means "keep the
// original default mark" -- see Logo.tsx.
//
// Two batches:
// - FLAT_CANDIDATES (20): 5 simple icon shapes x 4 flat brand colors.
// - GRADIENT_CANDIDATES (100): 10 more abstract/tech/art shapes x 10
//   gradient color pairs -- a distinct, more premium-tech visual register
//   from the first batch, not just more of the same.

export type LogoCandidate = {
  key: string;
  label: string;
  background: string;
  glyph: () => React.ReactNode;
};

const FLAT_COLORS = [
  { name: "Teal", hex: "#22c55e" },
  { name: "Orange", hex: "#f97316" },
  { name: "Indigo", hex: "#4f46e5" },
  { name: "Terracotta", hex: "#c2410c" },
];

// Hub with three satellites -- a matching/connection motif.
function orbitGlyph() {
  return (
    <>
      <circle cx="8" cy="8" r="2.6" fill="white" />
      <circle cx="8" cy="2.6" r="1.5" fill="white" opacity=".6" />
      <circle cx="12.7" cy="10.7" r="1.5" fill="white" opacity=".6" />
      <circle cx="3.3" cy="10.7" r="1.5" fill="white" opacity=".6" />
    </>
  );
}

// Two overlapping circles -- intersection/match between supplier and buyer.
function vennGlyph() {
  return (
    <>
      <circle cx="6" cy="8" r="4.2" fill="white" opacity=".55" />
      <circle cx="10" cy="8" r="4.2" fill="white" opacity=".75" />
    </>
  );
}

// Stylized "G" monogram.
function monogramGlyph() {
  return (
    <text x="8" y="11.6" textAnchor="middle" fontSize="10.5" fontWeight="800" fill="white" fontFamily="system-ui, sans-serif">
      G
    </text>
  );
}

// Three ascending bars -- growth.
function ascendGlyph() {
  return (
    <>
      <rect x="2.5" y="9" width="2.6" height="4.5" rx="1" fill="white" opacity=".5" />
      <rect x="6.7" y="6" width="2.6" height="7.5" rx="1" fill="white" opacity=".75" />
      <rect x="10.9" y="2.5" width="2.6" height="11" rx="1" fill="white" />
    </>
  );
}

// Hexagon outline with a center dot -- trust / verification.
function hexGlyph() {
  return (
    <>
      <polygon points="8,2 13,5 13,11 8,14 3,11 3,5" fill="none" stroke="white" strokeWidth="1.3" />
      <circle cx="8" cy="8" r="1.6" fill="white" />
    </>
  );
}

const FLAT_SHAPES = [
  { key: "orbit", name: "Orbit", glyph: orbitGlyph },
  { key: "venn", name: "Venn", glyph: vennGlyph },
  { key: "monogram", name: "Monogram", glyph: monogramGlyph },
  { key: "ascend", name: "Ascend", glyph: ascendGlyph },
  { key: "hex", name: "Hex", glyph: hexGlyph },
];

const FLAT_CANDIDATES: LogoCandidate[] = FLAT_SHAPES.flatMap((shape) =>
  FLAT_COLORS.map((color) => ({
    key: `${shape.key}-${color.name.toLowerCase()}`,
    label: `${shape.name} — ${color.name}`,
    background: color.hex,
    glyph: shape.glyph,
  })),
);

// ── Gradient / tech-art batch ────────────────────────────────────────────

const GRADIENTS = [
  { key: "emerald-sky", name: "Emerald Sky", from: "#10b981", to: "#0ea5e9" },
  { key: "sunset", name: "Sunset", from: "#f97316", to: "#f43f5e" },
  { key: "galaxy", name: "Galaxy", from: "#6366f1", to: "#a855f7" },
  { key: "steel", name: "Steel", from: "#475569", to: "#06b6d4" },
  { key: "ember", name: "Ember", from: "#b45309", to: "#f59e0b" },
  { key: "orchid", name: "Orchid", from: "#a855f7", to: "#ec4899" },
  { key: "meadow", name: "Meadow", from: "#16a34a", to: "#84cc16" },
  { key: "deep-space", name: "Deep Space", from: "#1e1b4b", to: "#6366f1" },
  { key: "coral", name: "Coral", from: "#f43f5e", to: "#f59e0b" },
  { key: "aqua", name: "Aqua", from: "#06b6d4", to: "#10b981" },
];

// Circuit trace with nodes -- tech/data motif.
function circuitGlyph() {
  return (
    <>
      <path d="M2 8 H6 V4 H12" stroke="white" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity=".85" />
      <path d="M6 8 V12 H14" stroke="white" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity=".55" />
      <circle cx="2" cy="8" r="1.1" fill="white" />
      <circle cx="12" cy="4" r="1.1" fill="white" />
      <circle cx="14" cy="12" r="1.1" fill="white" opacity=".7" />
    </>
  );
}

// Layered faceted triangles -- geometric/art.
function prismGlyph() {
  return (
    <>
      <polygon points="8,2 14,13 2,13" fill="white" opacity=".22" />
      <polygon points="8,5 12,13 4,13" fill="white" opacity=".5" />
      <polygon points="8,8 10,13 6,13" fill="white" opacity=".9" />
    </>
  );
}

// Flowing sine wave -- modern/dynamic.
function waveGlyph() {
  return <path d="M1.5 10 C4 5, 6 5, 8 10 S12 15, 14.5 10" stroke="white" strokeWidth="1.4" fill="none" strokeLinecap="round" />;
}

// Diamond grid of nodes -- data mesh/network.
function meshGlyph() {
  const points: [number, number, number][] = [
    [8, 2, 0.55],
    [4, 5, 0.55],
    [12, 5, 0.55],
    [8, 8, 1],
    [4, 11, 0.55],
    [12, 11, 0.55],
    [8, 14, 0.55],
  ];
  return (
    <>
      {points.map(([cx, cy, opacity], i) => (
        <circle key={i} cx={cx} cy={cy} r="1.3" fill="white" opacity={opacity} />
      ))}
    </>
  );
}

// Infinity loop -- elegant, ongoing partnership.
function infinityGlyph() {
  return (
    <path
      d="M4.5 8 C4.5 5.5, 7 5.5, 8 8 C9 10.5, 11.5 10.5, 11.5 8 C11.5 5.5, 9 5.5, 8 8 C7 10.5, 4.5 10.5, 4.5 8 Z"
      stroke="white"
      strokeWidth="1.3"
      fill="none"
    />
  );
}

// Nested squares -- recursive/fractal, abstract tech-art.
function fractalGlyph() {
  return (
    <>
      <rect x="2" y="2" width="12" height="12" rx="1.5" fill="none" stroke="white" strokeWidth="1" opacity=".45" />
      <rect x="5" y="5" width="6" height="6" rx="1" fill="none" stroke="white" strokeWidth="1.1" opacity=".75" />
      <rect x="7" y="7" width="2" height="2" fill="white" />
    </>
  );
}

// Angular blade/swoosh -- dynamic, forward motion.
function bladeGlyph() {
  return <path d="M2 13 L9 3 L11 3 L6 11 L14 11 L12 13 Z" fill="white" />;
}

// Ring with an offset satellite -- minimal orbit, more restrained than "Orbit".
function ringGlyph() {
  return (
    <>
      <circle cx="8" cy="8" r="5" fill="none" stroke="white" strokeWidth="1.4" opacity=".7" />
      <circle cx="12.2" cy="5" r="1.6" fill="white" />
    </>
  );
}

// Isometric cube line art -- structural/tech.
function cubeGlyph() {
  return (
    <>
      <polygon points="8,2 13.5,5 13.5,11 8,14 2.5,11 2.5,5" fill="none" stroke="white" strokeWidth="1" opacity=".55" />
      <polyline points="2.5,5 8,8 13.5,5" fill="none" stroke="white" strokeWidth="1" opacity=".55" />
      <line x1="8" y1="8" x2="8" y2="14" stroke="white" strokeWidth="1" opacity=".55" />
    </>
  );
}

// Organic brushstroke blob -- human, art-forward counterpoint to the rest.
function brushGlyph() {
  return (
    <path
      d="M3 9 C2 5, 6 2, 9 3 C13 4, 14 8, 12 11 C10 14, 5 14, 3 11 C2.3 10.2, 2.6 9.6, 3 9 Z"
      fill="white"
      opacity=".9"
    />
  );
}

const GRADIENT_SHAPES = [
  { key: "circuit", name: "Circuit", glyph: circuitGlyph },
  { key: "prism", name: "Prism", glyph: prismGlyph },
  { key: "wave", name: "Wave", glyph: waveGlyph },
  { key: "mesh", name: "Mesh", glyph: meshGlyph },
  { key: "infinity", name: "Infinity", glyph: infinityGlyph },
  { key: "fractal", name: "Fractal", glyph: fractalGlyph },
  { key: "blade", name: "Blade", glyph: bladeGlyph },
  { key: "ring", name: "Ring", glyph: ringGlyph },
  { key: "cube", name: "Cube", glyph: cubeGlyph },
  { key: "brush", name: "Brush", glyph: brushGlyph },
];

const GRADIENT_CANDIDATES: LogoCandidate[] = GRADIENT_SHAPES.flatMap((shape) =>
  GRADIENTS.map((gradient) => ({
    key: `${shape.key}-${gradient.key}`,
    label: `${shape.name} — ${gradient.name}`,
    background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`,
    glyph: shape.glyph,
  })),
);

export const LOGO_CANDIDATES: LogoCandidate[] = [...FLAT_CANDIDATES, ...GRADIENT_CANDIDATES];

export function findLogoCandidate(key: string | null | undefined): LogoCandidate | undefined {
  if (!key) return undefined;
  return LOGO_CANDIDATES.find((c) => c.key === key);
}
