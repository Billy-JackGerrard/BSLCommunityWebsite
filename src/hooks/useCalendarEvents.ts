import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import type { Event } from "../utils/types";

/** Last moment of next calendar month — used as the search window ceiling. */
const searchWindowEnd = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 2 + 1, 0, 23, 59, 59, 999);
};

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

      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("approved", true)
        .or(
          `and(starts_at.gte.${fromDate.toISOString()},starts_at.lte.${toDate.toISOString()}),` +
          `and(starts_at.lt.${fromDate.toISOString()},finishes_at.gte.${fromDate.toISOString()})`
        )
        .order("starts_at", { ascending: true });

      if (!isCurrent) return;
      if (error) console.error("Error fetching events:", error);
      else setEvents(data || []);
      setLoading(false);
    };

    fetchEvents();
    return () => { isCurrent = false; };
  }, [month, year]);

  // Forward-looking events for the search dropdown
  useEffect(() => {
    const fetchAll = async () => {
      const { data } = await supabase
        .from("events")
        .select("*")
        .eq("approved", true)
        .gte("starts_at", new Date().toISOString())
        .lte("starts_at", searchWindowEnd().toISOString())
        .order("starts_at", { ascending: true });
      setAllEvents(data || []);
    };
    fetchAll();
  }, []);

  return { events, allEvents, loading };
}