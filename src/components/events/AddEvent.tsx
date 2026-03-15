import { useState, useEffect, useRef } from "react";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { supabase } from "../../supabaseClient";
import EventForm from "./EventForm";
import type { EventFormRow } from "./EventForm";
import "./AddEvent.css";

declare global {
  interface Window {
    turnstile: {
      render: (container: string | HTMLElement, options: Record<string, unknown>) => string;
      reset: (widgetId: string) => void;
    };
  }
}

export default function AddEvent() {
  const [submitted, setSubmitted] = useState(false);
  const [submittedCount, setSubmittedCount] = useState(1);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);

  const turnstileRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      setIsAdmin(!!session);
      setAuthChecked(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        setIsAdmin(!!session);
        setAuthChecked(true);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Load the Turnstile script and render the widget
  useEffect(() => {
    const scriptId = "cf-turnstile-script";

    const renderWidget = () => {
      if (turnstileRef.current && window.turnstile && !widgetIdRef.current) {
        widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
          sitekey: import.meta.env.VITE_TURNSTILE_SITE_KEY,
          callback: (token: string) => setTurnstileToken(token),
          "expired-callback": () => setTurnstileToken(null),
          "error-callback": () => setTurnstileToken(null),
          theme: "dark",
        });
      }
    };

    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      script.async = true;
      script.defer = true;
      script.onload = renderWidget;
      document.head.appendChild(script);
    } else if (window.turnstile) {
      renderWidget();
    }
  }, [formKey]); // re-run when form resets so widget re-renders

  const handleSubmit = async (rows: EventFormRow[]) => {
    if (!turnstileToken) {
      setError("Please complete the captcha check.");
      return;
    }

    setLoading(true);
    setError(null);

    // Verify the Turnstile token via the Edge Function
    const verifyRes = await fetch(import.meta.env.VITE_TURNSTILE_ENDPOINT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_KEY}`,
      },
      body: JSON.stringify({ turnstileToken }),
    });

    const verifyData = await verifyRes.json();

    if (!verifyData.success) {
      setError("Captcha verification failed. Please try again.");
      setTurnstileToken(null);
      if (widgetIdRef.current) window.turnstile.reset(widgetIdRef.current);
      setLoading(false);
      return;
    }

    const { data: { session } }: { data: { session: Session | null } } =
      await supabase.auth.getSession();
    const admin = !!session?.user;

    const rowsWithMeta = rows.map(row => ({
      ...row,
      approved: admin,
      admin_id: admin ? session!.user.id : null,
    }));

    const { error: insertError } = await supabase.from("events").insert(rowsWithMeta);

    if (insertError) {
      setError(insertError.message);
      if (widgetIdRef.current) window.turnstile.reset(widgetIdRef.current);
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
    setTurnstileToken(null);
    widgetIdRef.current = null;
    setFormKey(k => k + 1); // remount EventForm + re-render Turnstile
  };

  if (submitted) {
    const isRecurring = submittedCount > 1;
    return (
      <div className="addevent-page">
        <div className="addevent-card">
          <div className="addevent-success">
            <div className="addevent-success-icon">✓</div>
            <h2 className="addevent-title">
              {isRecurring ? "Recurring Event Added!" : "Event Added!"}
            </h2>
            <p className="addevent-success-msg">
              {isAdmin ? (
                isRecurring
                  ? `${submittedCount} occurrences have been published directly to the calendar.`
                  : "Your event has been published directly to the calendar."
              ) : (
                isRecurring
                  ? `Thank you! ${submittedCount} occurrences have been submitted and are awaiting approval from an admin.`
                  : "Thank you! Your event has been submitted and is awaiting approval from an admin."
              )}
            </p>
            <button className="addevent-btn" onClick={resetForm}>
              Add Another Event
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="addevent-page">
      <div className="addevent-card">
        <h2 className="addevent-title">Add an Event</h2>

        {authChecked && !isAdmin && (
          <p className="addevent-subtitle">
            Events are reviewed by an admin before appearing on the calendar.
          </p>
        )}

        <EventForm
          key={formKey}
          showRecurrence={true}
          submitLabel="Add Event"
          submittingLabel="Submitting…"
          externalError={error}
          submitting={loading || !turnstileToken}
          onSubmit={handleSubmit}
        >
          {/* Turnstile lives here so it stays inside the card */}
          <div ref={turnstileRef} style={{ margin: "1rem 0" }} />
        </EventForm>
      </div>
    </div>
  );
}