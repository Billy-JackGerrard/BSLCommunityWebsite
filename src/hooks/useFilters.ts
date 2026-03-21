import { useState } from "react";
import type { DateFilter, DistanceCenter } from "../utils/eventFilters";

export type DistanceFilter = { center: DistanceCenter; radiusMiles: number } | null;
export const RADIUS_OPTIONS = [5, 10, 20, 30, 50] as const;
export type RadiusMiles = typeof RADIUS_OPTIONS[number];

export type Granularity = "day" | "week" | "month";

/**
 * Shared filter state for category and date filters.
 * Used by Calendar, EventList, and MapView.
 * - dateFilter: used by Calendar and EventList (date pills)
 * - granularity: used by MapView strip (day/week/month)
 */
export function useFilters() {
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [distanceFilter, setDistanceFilter] = useState<DistanceFilter>(null);
  const [granularity, setGranularity] = useState<Granularity>("week");

  function clearDistanceFilter() { setDistanceFilter(null); }

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

  return {
    selectedCategories, setSelectedCategories,
    dateFilter, setDateFilter,
    toggleCategory, clearCategories,
    distanceFilter, setDistanceFilter, clearDistanceFilter,
    granularity, setGranularity,
  };
}
