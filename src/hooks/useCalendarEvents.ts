import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import type { Event } from "../utils/types";

// Shared base query — approved events ordered by start time.
const approvedEvents = () =>
  supabase.from("events").select("*").eq("approved", true).order("starts_at", { ascending: true });

/**
 * Fetches approved events for the given month/year and a separate
 * forward-looking list used by the search dropdown.
 *
 * Search window: up to 1 year ahead. The 10-result cap is applied by
 * Calendar.tsx after filtering so the cap always reflects actual matches
 * rather than the raw pool size.
 */
export function useCalendarEvents(month: number, year: number) {
  const [events, setEvents] = useState<Event[]>([]);
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  // Current-month events for the grid
  useEffect(() => {
    let isCurrent = true;
    setEvents([]);
    setLoading(true);

    const fetchEvents = async () => {
      const fromDate = new Date(year, month, 1, 0, 0, 0, 0);
      const toDate   = new Date(year, month + 1, 0, 23, 59, 59, 999);

      const { data, error } = await approvedEvents()
        .or(
          `and(starts_at.gte.${fromDate.toISOString()},starts_at.lte.${toDate.toISOString()}),` +
          `and(starts_at.lt.${fromDate.toISOString()},finishes_at.gte.${fromDate.toISOString()})`
        );

      if (!isCurrent) return;
      if (error) console.error("Error fetching events:", error);
      else setEvents(data || []);
      setLoading(false);
    };

    fetchEvents();
    return () => { isCurrent = false; };
  }, [month, year]);

  // Forward-looking events for the search dropdown.
  // Fetches the full year window; the 10-result cap is applied after
  // filtering in Calendar so the cap reflects actual matches.
  useEffect(() => {
    const fetchAll = async () => {
      const now = new Date();
      const windowEnd = new Date(now);
      windowEnd.setFullYear(windowEnd.getFullYear() + 1);

      const { data } = await approvedEvents()
        .gte("starts_at", now.toISOString())
        .lte("starts_at", windowEnd.toISOString());

      setAllEvents(data || []);
    };
    fetchAll();
  }, []);

  return { events, allEvents, loading };
}