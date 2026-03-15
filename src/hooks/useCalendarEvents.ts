import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import type { Event } from "../utils/types";

// Fix #10: shared base query — approved events ordered by start time.
const approvedEvents = () =>
  supabase.from("events").select("*").eq("approved", true).order("starts_at", { ascending: true });

/**
 * Fetches approved events for the given month/year and a separate
 * forward-looking list used by the search dropdown.
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
  // Fix #1: compute the search window end *inside* the effect so it's always
  // fresh rather than being fixed at module-load time.
  useEffect(() => {
    const fetchAll = async () => {
      const now = new Date();
      // Last moment of next calendar month
      const windowEnd = new Date(now.getFullYear(), now.getMonth() + 2 + 1, 0, 23, 59, 59, 999);

      const { data } = await approvedEvents()
        .gte("starts_at", now.toISOString())
        .lte("starts_at", windowEnd.toISOString());

      setAllEvents(data || []);
    };
    fetchAll();
  }, []);

  return { events, allEvents, loading };
}