import { useState } from "react";
import type { DateFilter } from "../utils/eventFilters";

/**
 * Shared filter state for category and date filters.
 * Used by both Calendar and EventList to keep logic consistent.
 */
export function useFilters() {
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");

  function toggleCategory(cat: string) {
    setSelectedCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  function clearCategories() {
    setSelectedCategories(new Set());
  }

  return { selectedCategories, setSelectedCategories, dateFilter, setDateFilter, toggleCategory, clearCategories };
}
