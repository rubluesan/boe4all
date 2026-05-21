// Asegura que cualquier valor se convierta en Array si no lo es
export function ensureArray(value: any): any[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}
