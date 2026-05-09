export const SECTION_ACCENT = {
  Infofix:     { accent: '#6366f1', accentHover: '#4f46e5', accentLight: '#eef2ff', accentText: '#4338ca' },
  Refurbished: { accent: '#059669', accentHover: '#047857', accentLight: '#ecfdf5', accentText: '#065f46' },
  Wholesale:   { accent: '#db2777', accentHover: '#be185d', accentLight: '#fdf2f8', accentText: '#9d174d' },
} as const;

export type StoreSection = keyof typeof SECTION_ACCENT;
export type SectionTheme = typeof SECTION_ACCENT[StoreSection];