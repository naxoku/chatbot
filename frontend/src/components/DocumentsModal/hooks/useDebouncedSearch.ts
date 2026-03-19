import { useState, useEffect, useMemo } from "react";

export const useDebouncedSearch = <T,>(
  items: T[],
  filterFn: (item: T, searchTerm: string) => boolean,
  delay: number = 300
) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, delay]);

  const filteredItems = useMemo(() => {
    if (!items) return [];
    return items.filter((item) => filterFn(item, debouncedTerm));
  }, [items, debouncedTerm, filterFn]);

  return {
    searchTerm,
    setSearchTerm,
    debouncedTerm,
    filteredItems,
  };
};