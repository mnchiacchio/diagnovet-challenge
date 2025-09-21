// Utilidades para manejo de archivos

/**
 * Normaliza un nombre de archivo removiendo acentos y caracteres especiales
 * Mantiene el formato original pero sin acentos para evitar problemas de codificación
 */
export function normalizeFileName(fileName: string): string {
  return fileName
    .normalize('NFD') // Descompone caracteres acentuados
    .replace(/[\u0300-\u036f]/g, '') // Remueve diacríticos (acentos)
    .replace(/[^a-zA-Z0-9.-]/g, ' ') // Reemplaza caracteres especiales con espacios
    .replace(/\s+/g, ' ') // Reemplaza múltiples espacios con uno solo
    .trim(); // Remueve espacios del inicio y final
}

/**
 * Verifica si dos nombres de archivo son equivalentes
 * comparando versiones normalizadas
 */
export function areFileNamesEquivalent(name1: string, name2: string): boolean {
  const normalized1 = normalizeFileName(name1);
  const normalized2 = normalizeFileName(name2);
  
  return normalized1 === normalized2;
}
