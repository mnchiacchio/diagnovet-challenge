import { useState, useEffect } from 'react';

/**
 * Hook personalizado para debounce
 * Retarda la ejecución de una función hasta que haya pasado un tiempo determinado
 * sin que se vuelva a llamar
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
