import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "../../supabaseClient";
import { useTurnstile } from "../../hooks/useTurnstile";
import EventForm from "./EventForm";
import type { EventFormRow } from "./EventForm";
import type { Event } from "../../utils/types";
import { scaleSpring } from "../../utils/motion";
import "./shared-card.css";
import "./AddEvent.css";

type Props = {
  prefillDate?: string; // "YYYY-MM-DD" — pre-populates the start date when adding from calendar
  prefillEvent?: Event;  // pre-populates all fields when duplicating an event
  userId?: string | null;
  onBrowse?: () => void;
};

export default function AddEvent({ prefillDate, prefillEvent, userId, onBrowse }: Props) {
  const [submitted, setSubmitted] = useState(false);
  const [submittedCount, setSubmittedCount] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [formKey, setFormKey] = useState(0);

  const { containerRef: turnstileRef, token: turnstileToken, reset: resetTurnstile } =
    useTurnstile(import.meta.env.VITE_TURNSTILE_SITE_KEY as string, formKey);

  const handleSubmit = async (rows: EventFormRow[]) => {
    setLoading(true);
    setError(null);

    const endTime = rows[0].finishes_at ?? rows[0].starts_at;
    if (new Date(endTime) < new Date()) {
      setError("This event has already finished — please update the date and time.");
      setLoading(false);
      return;
    }

    if (!turnstileToken) {
      setError("Please complete the captcha check.");
      setLoading(false);
      return;
    }

    let verifyRes: Response;
    try {
      verifyRes = await fetch(import.meta.env.VITE_TURNSTILE_ENDPOINT_URL as string, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_KEY as string}`,
        },
        body: JSON.stringify({ turnstileToken }),
      });
    } catch {
      setError("Network error — please check your connection and try again.");
      resetTurnstile();
      setLoading(false);
      return;
    }

    if (!verifyRes.ok) {
      setError("Captcha verification failed. Please try again.");
      resetTurnstile();
      setLoading(false);
      return;
    }

    const verifyData = await verifyRes.json();

    if (!verifyData.success) {
      setError("Captcha verification failed. Please try again.");
      resetTurnstile();
      setLoading(false);
      return;
    }

    const rowsWithMeta = rows.map(row => ({
      ...row,
      approved: true,
      submitted_by: userId ?? null,
    }));

    const { error: insertError } = await supabase.from("events").insert(rowsWithMeta);

    if (insertError) {
      setError(insertError.message);
      resetTurnstile();
    } else {
      setSubmittedCount(rows.length);
      setSubmitted(true);
    }

    setLoading(false);
  };

  const resetForm = () => {
    setSubmitted(false);
    setSubmittedCount(1);
    setError(null);
    setFormKey(k => k + 1);
  };

  if (submitted) {
    const isRecurring = submittedCount > 1;
    return (
      <div className="addevent-page">
        <div className="page-card addevent-card">
          <div className="addevent-success">
            <motion.div
              className="addevent-success-icon"
              animate={{ scale: [0, 1.15, 1], opacity: [0, 1, 1] }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >✓</motion.div>
            <h2 className="addevent-title">
              {isRecurring ? "Recurring Event Added!" : "Event Added!"}
            </h2>
            <p className="addevent-success-msg">
              {isRecurring
                ? `${submittedCount} occurrences have been published to the calendar.`
                : "Your event has been published to the calendar."}
            </p>
            <div className="addevent-success-actions">
              <motion.button className="btn-primary" onClick={resetForm} whileTap={scaleSpring.tap}>
                Add Another Event
              </motion.button>
              {onBrowse && (
                <motion.button className="btn-secondary" onClick={onBrowse} whileTap={scaleSpring.tap}>
                  Browse Events
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="addevent-page">
      <div className="page-card addevent-card">
        <h2 className="addevent-title">Add an Event</h2>

        <EventForm
          key={formKey}
          initialValues={prefillEvent}
          prefillDate={prefillDate}
          showRecurrence={true}
          submitLabel="Add Event"
          submittingLabel="Submitting…"
          externalError={error}
          submitting={loading}
          submitDisabled={!turnstileToken}
          onSubmit={handleSubmit}
        >
          <div ref={turnstileRef} style={{ margin: "1rem 0" }} />
        </EventForm>
      </div>
    </div>
  );
}