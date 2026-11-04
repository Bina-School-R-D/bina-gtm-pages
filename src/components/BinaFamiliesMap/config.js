/**
 * Brand settings for the bina families map.
 * Colours come from the bina colour system. Change them here, not in the CSS.
 */

// "Current bina families" tab: dot colour by continent. Order = legend order.
export const CONTINENTS = [
  { id: 'north-america', label: 'North America', color: '#55EED4' }, // lagoon
  { id: 'south-america', label: 'South America', color: '#64E27B' }, // clover
  { id: 'europe',        label: 'Europe',        color: '#FE49C1' }, // dragon fruit
  { id: 'africa',        label: 'Africa',        color: '#FF8A3D' }, // tangerine
  { id: 'asia',          label: 'Asia',          color: '#78C0FE' }, // sky blue
  { id: 'australia',     label: 'Australia',     color: '#FFE916' }, // lemon
];

// "Families exploring bina" tab: every dot is the same mint.
export const EXPLORING_COLOR = '#D8F6C8';

export const THEME = {
  land: '#000000',      // continents in black on primary base #1C1C1C
  dotStroke: '#1C1C1C', // thin outline keeps neighbouring dots readable
  labelBg: '#000000',
  labelText: '#D8F6C8',
};

/**
 * Current families: dot radius in screen px, same formula as the original map.
 * 1 student = smallest dot, growing with the square root of the count.
 */
export const studentDotRadius = (students) => 4 + 2.6 * Math.sqrt(Math.max(1, students) - 1);

/**
 * Exploring families: one dot per country, sized by how many students (children) are
 * exploring bina from there, the same square-root approach as the current-families tab.
 * The data stores `size` (0 = 1 student, 1 = the largest country) instead of exact numbers,
 * so the smallest dot matches the current tab's 1-student dot and the largest is capped.
 */
export const EXPLORING_MIN_R = 4;  // same as a 1-student dot on the current tab
export const EXPLORING_MAX_R = 30; // the largest country
export const exploringDotRadius = (size) =>
  EXPLORING_MIN_R + (EXPLORING_MAX_R - EXPLORING_MIN_R) * Math.max(0, Math.min(1, size));

/** How close (in screen px, beyond the dot's edge) the pointer must be to pick a dot. */
export const HOVER_SLOP = 10;
