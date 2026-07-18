// 20 placeholder brand marks (5 shapes x 4 colors) for the admin logo
// picker (admin/platform-settings/logo) -- no image-generation tool is
// available here, so these are hand-authored SVG glyphs, not renders.
// Each glyph assumes a 16x16 viewBox drawn in white over a colored
// rounded-square background (matching the existing default mark's look in
// apps/web/src/app/page.tsx). `null` (not a candidate here) means "keep the
// original default mark" -- see Logo.tsx.

export type LogoCandidate = {
  key: string;
  label: string;
  background: string;
  glyph: () => React.ReactNode;
};

const COLORS = [
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

const SHAPES = [
  { key: "orbit", name: "Orbit", glyph: orbitGlyph },
  { key: "venn", name: "Venn", glyph: vennGlyph },
  { key: "monogram", name: "Monogram", glyph: monogramGlyph },
  { key: "ascend", name: "Ascend", glyph: ascendGlyph },
  { key: "hex", name: "Hex", glyph: hexGlyph },
];

export const LOGO_CANDIDATES: LogoCandidate[] = SHAPES.flatMap((shape) =>
  COLORS.map((color) => ({
    key: `${shape.key}-${color.name.toLowerCase()}`,
    label: `${shape.name} — ${color.name}`,
    background: color.hex,
    glyph: shape.glyph,
  })),
);

export function findLogoCandidate(key: string | null | undefined): LogoCandidate | undefined {
  if (!key) return undefined;
  return LOGO_CANDIDATES.find((c) => c.key === key);
}
