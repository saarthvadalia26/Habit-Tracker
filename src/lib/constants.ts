export interface ColorTheme {
  id: string;
  name: string;
  hex: string;
  bgLight: string;
  borderLight: string;
  shadowColor: string;
  glowClass: string;
}

export const COLOR_THEMES: ColorTheme[] = [
  {
    id: 'indigo',
    name: 'Cosmic Indigo',
    hex: '#6366F1',
    bgLight: 'rgba(99, 102, 241, 0.12)',
    borderLight: 'rgba(99, 102, 241, 0.3)',
    shadowColor: 'rgba(99, 102, 241, 0.25)',
    glowClass: 'shadow-indigo-500/30',
  },
  {
    id: 'emerald',
    name: 'Neo Emerald',
    hex: '#10B981',
    bgLight: 'rgba(16, 185, 129, 0.12)',
    borderLight: 'rgba(16, 185, 129, 0.3)',
    shadowColor: 'rgba(16, 185, 129, 0.25)',
    glowClass: 'shadow-emerald-500/30',
  },
  {
    id: 'rose',
    name: 'Stellar Rose',
    hex: '#F43F5E',
    bgLight: 'rgba(244, 63, 94, 0.12)',
    borderLight: 'rgba(244, 63, 94, 0.3)',
    shadowColor: 'rgba(244, 63, 94, 0.25)',
    glowClass: 'shadow-rose-500/30',
  },
  {
    id: 'amber',
    name: 'Solar Amber',
    hex: '#F59E0B',
    bgLight: 'rgba(245, 158, 11, 0.12)',
    borderLight: 'rgba(245, 158, 11, 0.3)',
    shadowColor: 'rgba(245, 158, 11, 0.25)',
    glowClass: 'shadow-amber-500/30',
  },
  {
    id: 'cyan',
    name: 'Aqua Cyan',
    hex: '#06B6D4',
    bgLight: 'rgba(6, 182, 212, 0.12)',
    borderLight: 'rgba(6, 182, 212, 0.3)',
    shadowColor: 'rgba(6, 182, 212, 0.25)',
    glowClass: 'shadow-cyan-500/30',
  },
  {
    id: 'purple',
    name: 'Orbit Purple',
    hex: '#A855F7',
    bgLight: 'rgba(168, 85, 247, 0.12)',
    borderLight: 'rgba(168, 85, 247, 0.3)',
    shadowColor: 'rgba(168, 85, 247, 0.25)',
    glowClass: 'shadow-purple-500/30',
  },
  {
    id: 'blue',
    name: 'Zero-G Blue',
    hex: '#3B82F6',
    bgLight: 'rgba(59, 130, 246, 0.12)',
    borderLight: 'rgba(59, 130, 246, 0.3)',
    shadowColor: 'rgba(59, 130, 246, 0.25)',
    glowClass: 'shadow-blue-500/30',
  },
];

export function getColorThemeByHex(hex: string): ColorTheme {
  const found = COLOR_THEMES.find(
    (theme) => theme.hex.toLowerCase() === hex.toLowerCase()
  );
  if (found) return found;

  return {
    id: 'custom',
    name: 'Custom',
    hex: hex || '#6366F1',
    bgLight: `${hex || '#6366F1'}1F`,
    borderLight: `${hex || '#6366F1'}4D`,
    shadowColor: `${hex || '#6366F1'}40`,
    glowClass: 'shadow-indigo-500/30',
  };
}
