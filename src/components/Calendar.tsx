import { useState, useEffect, useMemo } from "react";
import { supabase } from "../supabaseClient";
import { MONTHS, formatTime, toLocalDateKey } from "../utils/dates";
import type { Event } from "../utils/types";
import "./Calendar.css";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function Calendar() {

  const [today, setToday] = useState(() => new Date());

  useEffect(() => {
    const msUntilMidnight = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      return midnight.getTime() - now.getTime();
    };

    // Schedule the first tick at the next midnight, then repeat every 24 h.
    const timeout = setTimeout(() => {
      setToday(new Date());
      const interval = setInterval(() => setToday(new Date()), 24 * 60 * 60 * 1000);
      return () => clearInterval(interval);
    }, msUntilMidnight());

    return () => clearTimeout(timeout);
  }, []);

  const [current, setCurrent] = useState({
    month: today.getMonth(),
    year: today.getFullYear(),
  });

  const [selected, setSelected] = useState<number | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isCurrent = true;

    setEvents([]);
    setLoading(true);

    const fetchEvents = async () => {
      const fromDate = new Date(current.year, current.month, 1, 0, 0, 0, 0);
      const toDate   = new Date(current.year, current.month + 1, 0, 23, 59, 59, 999);

      const from = fromDate.toISOString();
      const to   = toDate.toISOString();

      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("approved", true)
        .or(`and(starts_at.gte.${from},starts_at.lte.${to}),and(starts_at.lt.${from},finishes_at.gte.${from})`)
        .order("starts_at", { ascending: true });

      if (!isCurrent) return;

      if (error) console.error("Error fetching events:", error);
      else setEvents(data || []);

      setLoading(false);
    };

    fetchEvents();

    return () => { isCurrent = false; };
  }, [current.month, current.year]);

  const prev = () => {
    setSelected(null);
    setCurrent(c =>
      c.month === 0
        ? { month: 11, year: c.year - 1 }
        : { month: c.month - 1, year: c.year }
    );
  };

  const next = () => {
    setSelected(null);
    setCurrent(c =>
      c.month === 11
        ? { month: 0, year: c.year + 1 }
        : { month: c.month + 1, year: c.year }
    );
  };

  const eventsByDate = useMemo(() => {
    const map = new Map<string, Event[]>();

    for (const e of events) {
      const startKey  = toLocalDateKey(e.starts_at);
      const finishKey = toLocalDateKey(e.finishes_at ?? e.starts_at);

      // Walk every local date the event spans and add it to that bucket.
      const cursor = new Date(startKey);
      const end    = new Date(finishKey);

      while (cursor <= end) {
        const key = [
          cursor.getFullYear(),
          String(cursor.getMonth() + 1).padStart(2, "0"),
          String(cursor.getDate()).padStart(2, "0"),
        ].join("-");

        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(e);

        cursor.setDate(cursor.getDate() + 1);
      }
    }

    return map;
  }, [events]);

  const eventsOnDay = (day: number): Event[] => {
    const key = [
      current.year,
      String(current.month + 1).padStart(2, "0"),
      String(day).padStart(2, "0"),
    ].join("-");

    return eventsByDate.get(key) ?? [];
  };

  const isToday = (day: number) =>
    day === today.getDate() &&
    current.month === today.getMonth() &&
    current.year === today.getFullYear();

  const isSelected = (day: number) => selected === day;

  const firstDay    = new Date(current.year, current.month, 1).getDay();
  const daysInMonth = new Date(current.year, current.month + 1, 0).getDate();

  const cells = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const selectedEvents = selected ? eventsOnDay(selected) : [];

  return (
    <div className="calendar-page">
      <div className="calendar-card">

        {/* Header */}
        <div className="calendar-header">
          <button className="calendar-nav-btn" onClick={prev}>‹</button>
          <div className="calendar-title">
            <div className="calendar-month">{MONTHS[current.month]}</div>
            <div className="calendar-year">{current.year}</div>
          </div>
          <button className="calendar-nav-btn" onClick={next}>›</button>
        </div>

        {/* Day labels */}
        <div className="calendar-day-labels">
          {DAYS.map(d => (
            <div key={d} className="calendar-day-label">{d}</div>
          ))}
        </div>

        {/* Day grid */}
        <div className="calendar-grid">
          {cells.map((day, i) => {
            const cellClass = [
              "calendar-cell",
              !day                   ? "calendar-cell--empty"    : "",
              day && isToday(day)    ? "calendar-cell--today"    : "",
              day && isSelected(day) ? "calendar-cell--selected" : "",
            ].filter(Boolean).join(" ");

            return (
              <div key={i} className={cellClass} onClick={() => day && setSelected(day)}>
                {day && (
                  <>
                    <span className="calendar-day-number">{day}</span>
                    {eventsOnDay(day).length > 0 && <span className="calendar-event-dot" />}
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Event panel */}
        <div className="calendar-event-panel">
          {loading ? (
            <div className="calendar-event-placeholder">Loading events…</div>
          ) : selected ? (
            <>
              <div className="calendar-event-date">
                {selected} {MONTHS[current.month]}
              </div>
              {selectedEvents.length > 0 ? (
                selectedEvents.map(ev => (
                  <div key={ev.id} className="calendar-event-item">
                    · {formatTime(ev.starts_at)}{ev.finishes_at ? ` – ${formatTime(ev.finishes_at)}` : ""} — {ev.title}
                    {ev.location && <span style={{ opacity: 0.6 }}> @ {ev.location}</span>}
                  </div>
                ))
              ) : (
                <div className="calendar-event-empty">No events scheduled</div>
              )}
            </>
          ) : (
            <div className="calendar-event-placeholder">Select a day to view events</div>
          )}
        </div>

      </div>
    </div>
  );
}