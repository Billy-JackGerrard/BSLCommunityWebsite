import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import type { Event } from "../utils/types";
import { CATEGORY_COLOURS } from "../utils/types";
import { MONTHS, formatDateTimeRange } from "../utils/dates";
import EventDetailCard from "./events/EventDetails";
import "./EventList.css";

type Props = {
  isLoggedIn: boolean;
  onEditEvent: (event: Event) => void;
  onDeleteEvent?: (event: Event) => void;
};

type MonthGroup = {
  label: string;
  events: Event[];
};

function groupByMonth(events: Event[]): MonthGroup[] {
  const groups = new Map<string, Event[]>();
  for (const ev of events) {
    const d = new Date(ev.starts_at);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(ev);
  }
  return Array.from(groups.entries()).map(([key, evs]) => {
    const [year, month] = key.split("-").map(Number);
    return { label: `${MONTHS[month]} ${year}`, events: evs };
  });
}

export default function EventList({ isLoggedIn, onEditEvent, onDeleteEvent }: Props) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const now = new Date();
    const end = new Date(now);
    end.setFullYear(end.getFullYear() + 1);

    supabase
      .from("events")
      .select("*")
      .eq("approved", true)
      .gte("starts_at", now.toISOString())
      .lte("starts_at", end.toISOString())
      .order("starts_at", { ascending: true })
      .then(({ data }) => {
        setEvents(data || []);
        setLoading(false);
      });
  }, []);

  function toggleExpand(id: string) {
    setExpandedId(prev => (prev === id ? null : id));
  }

  const groups = groupByMonth(events);

  return (
    <div className="event-list-page">
      <div className="event-list-container">
        {loading ? (
          <div className="event-list-loading">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="event-list-skeleton" />
            ))}
          </div>
        ) : groups.length === 0 ? (
          <div className="event-list-empty">No upcoming events found.</div>
        ) : (
          groups.map(group => (
            <section key={group.label} className="event-list-month">
              <h2 className="event-list-month-heading">{group.label}</h2>
              <div className="event-list-items">
                {group.events.map(ev => (
                  <div key={ev.id} className="event-list-item-wrap">
                    <button
                      className={`event-list-item${expandedId === ev.id ? " event-list-item--expanded" : ""}`}
                      onClick={() => toggleExpand(ev.id)}
                    >
                      <span
                        className="event-list-dot"
                        style={{ background: CATEGORY_COLOURS[ev.category] }}
                      />
                      <span className="event-list-title">{ev.title}</span>
                      <span className="event-list-time">{formatDateTimeRange(ev.starts_at, ev.finishes_at)}</span>
                      {ev.location && (
                        <span className="event-list-location">📍 {ev.location}</span>
                      )}
                      <span className="event-list-chevron">{expandedId === ev.id ? "▼" : "▶"}</span>
                    </button>
                    {expandedId === ev.id && (
                      <div className="event-list-detail">
                        <EventDetailCard
                          event={ev}
                          isLoggedIn={isLoggedIn}
                          onClose={() => setExpandedId(null)}
                          onEdit={onEditEvent}
                          onDelete={onDeleteEvent}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
