import { useState } from "react";
import { supabase } from "../../supabaseClient";
import EventForm from "./EventForm";
import type { EventFormRow } from "./EventForm";
import type { Event } from "../../utils/types";
import "./AddEvent.css";

type Props = {
  event: Event;
  onSaved: (updated: Event) => void;
  onCancel: () => void;
};

type RecurringScope = "single" | "all-future";

export default function EditEvent({ event, onSaved, onCancel }: Props) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // For recurring events: hold the validated row while we ask the user
  const [pendingRow, setPendingRow] = useState<EventFormRow | null>(null);

  // ── Step 1: form submits → decide scope ──────────────────────────

  const handleFormSubmit = (rows: EventFormRow[]) => {
    const row = rows[0]; // showRecurrence=false so always exactly one row
    if (event.recurrence_id) {
      setPendingRow(row);   // show scope prompt
    } else {
      applyEdit(row, "single");
    }
  };

  // ── Step 2: apply the edit ────────────────────────────────────────

  const applyEdit = async (row: EventFormRow, scope: RecurringScope) => {
    setSaving(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();

    const patch = {
      title:         row.title,
      description:   row.description,
      location:      row.location,
      starts_at:     row.starts_at,
      finishes_at:   row.finishes_at,
      contact_name:  row.contact_name,
      contact_email: row.contact_email,
      url:           row.url,
      whatsapp_url:  row.whatsapp_url,
      price:         row.price,
      booking_info:  row.booking_info,
      admin_id:      user?.id,
    };

    if (scope === "single") {
      const { data, error: err } = await supabase
        .from("events")
        .update(patch)
        .eq("id", event.id)
        .select()
        .single();

      if (err) { setError(err.message); setSaving(false); return; }
      onSaved(data as Event);

    } else {
      // Fetch all future occurrences in this recurrence group
      const { data: futures, error: fetchErr } = await supabase
        .from("events")
        .select("id, starts_at, finishes_at")
        .eq("recurrence_id", event.recurrence_id!)
        .gte("starts_at", event.starts_at);

      if (fetchErr) { setError(fetchErr.message); setSaving(false); return; }

      // Calculate time deltas so each occurrence's slot shifts proportionally
      const origStart  = new Date(event.starts_at).getTime();
      const newStart   = new Date(row.starts_at).getTime();
      const startDelta = newStart - origStart;

      const origFinish  = event.finishes_at  ? new Date(event.finishes_at).getTime()  : null;
      const newFinish   = row.finishes_at     ? new Date(row.finishes_at).getTime()    : null;
      const duration    = origFinish !== null && newFinish !== null
        ? newFinish - newStart
        : null;

      const patchPromises = (futures ?? []).map(
        (future: { id: string; starts_at: string; finishes_at: string | null }) => {
          const futureStart   = new Date(future.starts_at).getTime();
          const shiftedStart  = new Date(futureStart + startDelta).toISOString();
          const shiftedFinish = duration !== null
            ? new Date(futureStart + startDelta + duration).toISOString()
            : null;

          return supabase
            .from("events")
            .update({ ...patch, starts_at: shiftedStart, finishes_at: shiftedFinish })
            .eq("id", future.id);
        }
      );

      const results  = await Promise.all(patchPromises);
      const firstErr = results.find(r => r.error)?.error;
      if (firstErr) { setError(firstErr.message); setSaving(false); return; }

      // Return the freshly-updated version of the event we started from
      const { data: refreshed } = await supabase
        .from("events").select("*").eq("id", event.id).single();
      onSaved(refreshed as Event);
    }

    setSaving(false);
  };

  // ── Recurring scope prompt ────────────────────────────────────────

  if (pendingRow) {
    return (
      <div className="addevent-page">
        <div className="addevent-card">
          <h2 className="addevent-title">Edit Recurring Event</h2>

          <p style={{ color: "var(--color-text-primary)", fontSize: "0.92rem", lineHeight: 1.6, margin: "0 0 1.25rem" }}>
            <strong style={{ color: "var(--color-accent)" }}>{event.title}</strong> is part
            of a recurring series. Which occurrences do you want to update?
          </p>

          {error && <div className="addevent-error">{error}</div>}

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1rem" }}>
            <button
              className="addevent-btn"
              style={{ textAlign: "left", padding: "0.85rem 1rem" }}
              onClick={() => applyEdit(pendingRow, "single")}
              disabled={saving}
            >
              <div style={{ fontFamily: "Georgia, serif", marginBottom: "0.2rem" }}>
                {saving ? "Saving…" : "Just this event"}
              </div>
              <div style={{ fontSize: "0.78rem", fontWeight: "normal", fontFamily: "monospace", opacity: 0.7 }}>
                Only update this single occurrence
              </div>
            </button>

            <button
              className="addevent-btn"
              style={{ textAlign: "left", padding: "0.85rem 1rem", background: "var(--color-bg-inset)", color: "var(--color-accent)", border: "1px solid var(--color-border)" }}
              onClick={() => applyEdit(pendingRow, "all-future")}
              disabled={saving}
            >
              <div style={{ fontFamily: "Georgia, serif", marginBottom: "0.2rem" }}>
                {saving ? "Saving…" : "This & all future events"}
              </div>
              <div style={{ fontSize: "0.78rem", fontWeight: "normal", fontFamily: "monospace", opacity: 0.7 }}>
                Update this occurrence and all that follow it
              </div>
            </button>
          </div>

          <button
            style={{ background: "none", border: "none", color: "var(--color-text-muted)", fontFamily: "monospace", fontSize: "0.8rem", cursor: "pointer", padding: 0 }}
            onClick={() => setPendingRow(null)}
            disabled={saving}
          >
            ← Back to edit
          </button>
        </div>
      </div>
    );
  }

  // ── Main edit form ────────────────────────────────────────────────

  return (
    <div className="addevent-page">
      <div className="addevent-card">
        <h2 className="addevent-title">Edit Event</h2>

        {event.recurrence_id && (
          <p className="addevent-subtitle">↻ This is a recurring event</p>
        )}

        <EventForm
          initialValues={event}
          showRecurrence={false}
          submitLabel="Save Changes"
          submittingLabel="Saving…"
          externalError={error}
          submitting={saving}
          onSubmit={handleFormSubmit}
          onCancel={onCancel}
        />
      </div>
    </div>
  );
}