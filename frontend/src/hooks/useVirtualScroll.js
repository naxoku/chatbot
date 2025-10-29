import { useState, useEffect, useRef, useCallback, useMemo } from "react";

/**
 * Hook personalizado para virtual scrolling optimizado
 * Renderiza solo los elementos visibles + buffer para scroll fluido
 * 
 * @param {Array} items - Array de elementos a renderizar
 * @param {number} itemHeight - Altura fija de cada item (en px)
 * @param {number} containerHeight - Altura del contenedor (en px)
 * @param {number} bufferSize - Número de items extra a renderizar (default: 5)
 * @returns {Object} - Estado y funciones para virtual scrolling
 */
const useVirtualScroll = (
  items = [], 
  itemHeight = 80, 
  containerHeight = 600, 
  bufferSize = 5
) => {
  const containerRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerSize, setContainerSize] = useState(containerHeight);

  // Calcular cuántas items caben en el viewport
  const visibleItemCount = useMemo(() => {
    return Math.ceil(containerSize / itemHeight);
  }, [containerSize, itemHeight]);

  // Calcular el índice de inicio y fin de items visibles
  const [startIndex, endIndex] = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - bufferSize);
    const end = Math.min(
      items.length,
      start + visibleItemCount + (bufferSize * 2)
    );
    return [start, end];
  }, [scrollTop, itemHeight, visibleItemCount, bufferSize, items.length]);

  // Items visibles con sus posiciones
  const visibleItems = useMemo(() => {
    const itemsToRender = [];
    
    for (let i = startIndex; i < endIndex; i++) {
      if (items[i]) {
        itemsToRender.push({
          item: items[i],
          index: i,
          top: i * itemHeight,
          style: {
            position: 'absolute',
            top: `${i * itemHeight}px`,
            left: 0,
            right: 0,
            height: `${itemHeight}px`
          }
        });
      }
    }
    
    return itemsToRender;
  }, [items, startIndex, endIndex, itemHeight]);

  // Altura total del contenido virtual
  const totalHeight = useMemo(() => {
    return items.length * itemHeight;
  }, [items.length, itemHeight]);

  // Scroll handler optimizado
  const handleScroll = useCallback((e) => {
    const newScrollTop = e.target.scrollTop;
    setScrollTop(newScrollTop);
  }, []);

  // Medir el contenedor
  const measureContainer = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const height = rect.height || containerHeight;
      if (height !== containerSize) {
        setContainerSize(height);
      }
    }
  }, [containerHeight, containerSize]);

  // Observador de resize
  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      measureContainer();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [measureContainer]);

  // Auto-measure en mount
  useEffect(() => {
    const timeoutId = setTimeout(measureContainer, 100);
    return () => clearTimeout(timeoutId);
  }, [measureContainer]);

  // Funciones de utilidad
  const scrollToIndex = useCallback((index, behavior = 'smooth') => {
    if (containerRef.current) {
      const scrollPosition = index * itemHeight;
      containerRef.current.scrollTo({
        top: scrollPosition,
        behavior
      });
    }
  }, [itemHeight]);

  const scrollToTop = useCallback((behavior = 'smooth') => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: 0,
        behavior
      });
    }
  }, []);

  const scrollToBottom = useCallback((behavior = 'smooth') => {
    if (containerRef.current) {
      const scrollPosition = Math.max(0, totalHeight - containerSize);
      containerRef.current.scrollTo({
        top: scrollPosition,
        behavior
      });
    }
  }, [totalHeight, containerSize]);

  // Estadísticas de rendimiento
  const stats = useMemo(() => {
    const visiblePercentage = ((endIndex - startIndex) / items.length) * 100;
    const renderedItemCount = endIndex - startIndex;
    
    return {
      totalItems: items.length,
      visibleItems: renderedItemCount,
      hiddenItems: items.length - renderedItemCount,
      visiblePercentage: Math.round(visiblePercentage * 100) / 100,
      startIndex,
      endIndex,
      scrollPosition: scrollTop,
      containerHeight: containerSize,
      totalHeight,
      efficiency: renderedItemCount > 0 ? items.length / renderedItemCount : 0
    };
  }, [items.length, endIndex, startIndex, scrollTop, containerSize, totalHeight]);

  return {
    // Refs
    containerRef,
    
    // Estado
    visibleItems,
    totalHeight,
    stats,
    
    // Scroll handlers
    handleScroll,
    scrollToIndex,
    scrollToTop,
    scrollToBottom,
    
    // Configuración
    itemHeight,
    containerHeight: containerSize,
    bufferSize,
    startIndex,
    endIndex
  };
};

export default useVirtualScroll;