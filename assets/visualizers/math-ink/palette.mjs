/** Shared pigments. Read CSS overrides once when constructing a scene. */
export const palette = Object.freeze({
  paper: '#ffffff', ivory: '#f3f1e9', ink: '#242720', blue: '#52638a',
  gold: '#c38b13', purple: '#82529d', olive: '#7a8337', rust: '#b85e38'
});

export function readPalette(element) {
  const style = getComputedStyle(element);
  return Object.fromEntries(Object.entries(palette).map(([key, value]) =>
    [key, style.getPropertyValue(`--mi-${key}`).trim() || value]));
}
