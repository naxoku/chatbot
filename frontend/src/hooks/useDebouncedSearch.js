import { useState, useEffect, useMemo, useRef, useCallback } from "react";

/**
 * Hook personalizado para búsqueda con debouncing optimizado
 * Reduce el número de operaciones de filtrado mientras el usuario escribe
 * 
 * @param {Array} items - Array de elementos a filtrar
 * @param {Function} filterFn - Función para filtrar elementos
 * @param {number} delay - Delay en milisegundos antes de ejecutar la búsqueda (default: 300)
 * @returns {Object} - Objeto con estados y resultados de la búsqueda
 */
const useDebouncedSearch = (items = [], filterFn = null, delay = 300) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [filteredItems, setFilteredItems] = useState(items);
  
  // Cache para búsquedas recientes
  const searchCache = useRef(new Map());
  const timeoutRef = useRef(null);

  // Función de filtro por defecto
  const defaultFilter = useCallback((item, term) => {
    const searchLower = term.toLowerCase();
    
    // Buscar en múltiples campos
    const titleMatch = item.title?.toLowerCase().includes(searchLower);
    const descMatch = item.description?.toLowerCase().includes(searchLower);
    const nameMatch = item.name?.toLowerCase().includes(searchLower);
    const contentMatch = item.content?.toLowerCase().includes(searchLower);
    const categoryMatch = item.category?.toLowerCase().includes(searchLower);
    
    // Buscar en keywords si existen
    const keywordsMatch = item.keywords?.some(keyword => 
      keyword.toLowerCase().includes(searchLower)
    );
    
    return titleMatch || descMatch || nameMatch || contentMatch || 
           categoryMatch || keywordsMatch || false;
  }, []);

  // Usar filterFn personalizada o la por defecto
  const effectiveFilter = filterFn || defaultFilter;

  // Debounce del término de búsqueda
  useEffect(() => {
    // Limpiar timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Si el término está vacío, limpiar búsqueda inmediatamente
    if (!searchTerm.trim()) {
      setDebouncedSearch("");
      setIsSearching(false);
      setFilteredItems(items);
      return;
    }

    // Iniciar estado de búsqueda
    setIsSearching(true);

    // Configurar nuevo timeout
    timeoutRef.current = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setIsSearching(false);
    }, delay);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [searchTerm, delay, items.length, setDebouncedSearch, setIsSearching, setFilteredItems, items]);

  // Filtrar items con el término debounced y cache
  const memoizedFilteredItems = useMemo(() => {
    // Si no hay término de búsqueda, devolver items originales
    if (!debouncedSearch.trim()) {
      return items;
    }

    const cacheKey = `${debouncedSearch}-${items.length}-${effectiveFilter.name || 'default'}`;
    const cached = searchCache.current.get(cacheKey);

    // Si el resultado está en cache y es reciente (1 minuto), usarlo
    if (cached && Date.now() - cached.timestamp < 60000) {
      return cached.result;
    }

    // Ejecutar filtro
    const result = items.filter(item => effectiveFilter(item, debouncedSearch));

    // Guardar en cache
    searchCache.current.set(cacheKey, {
      result,
      timestamp: Date.now()
    });

    // Limitar cache a 50 entradas para evitar memory leaks
    if (searchCache.current.size > 50) {
      const firstKey = searchCache.current.keys().next().value;
      searchCache.current.delete(firstKey);
    }

    return result;
  }, [items, debouncedSearch, effectiveFilter]);

  // Actualizar filteredItems cuando cambian los memoizedFilteredItems
  useEffect(() => {
    setFilteredItems(memoizedFilteredItems);
  }, [memoizedFilteredItems, items]);

  // Limpiar cache cuando cambian los items
  useEffect(() => {
    searchCache.current.clear();
  }, [items]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      // Copiar el valor del ref antes de usarlo en cleanup
      const cache = searchCache.current;
      cache.clear();
    };
  }, [searchCache]);

  // Función para limpiar búsqueda
  const clearSearch = useCallback(() => {
    setSearchTerm("");
    setDebouncedSearch("");
    setIsSearching(false);
    setFilteredItems(items);
    searchCache.current.clear();
  }, [items]);

  // Función para prefijar término (para sugerencias)
  const prependTerm = useCallback((term) => {
    setSearchTerm(prev => prev + term);
  }, []);

  // Función para reemplazar término (para reemplazo rápido)
  const replaceTerm = useCallback((term) => {
    setSearchTerm(term);
  }, []);

  return {
    // Estados
    searchTerm,
    setSearchTerm,
    filteredItems,
    isSearching,
    isDebouncing: searchTerm !== debouncedSearch && searchTerm.length > 0,
    
    // Funciones útiles
    clearSearch,
    prependTerm,
    replaceTerm,
    
    // Estadísticas
    totalItems: items.length,
    filteredCount: filteredItems.length,
    cacheSize: searchCache.current.size,
    
    // Configuración
    delay,
    hasResults: filteredItems.length > 0,
    isEmptySearch: searchTerm.length === 0
  };
};

export default useDebouncedSearch;