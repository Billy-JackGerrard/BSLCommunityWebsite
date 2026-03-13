import { useState } from "react";
import { supabase } from "../supabaseClient";
import "./AddEvent.css";

export default function AddEvent() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [finishesAt, setFinishesAt] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title || !startsAt) {
      setError("Please fill in at least a title and start time.");
      return;
    }

    setLoading(true);
    setError(null);

    const { error } = await supabase.from("events").insert({
      title,
      description: description || null,
      location: location || null,
      starts_at: startsAt,
      finishes_at: finishesAt || null,
      approved: false,
    });

    if (error) {
      setError(error.message);
    } else {
      setSubmitted(true);
    }

    setLoading(false);
  };

  if (submitted) {
    return (
      <div className="addevent-page">
        <div className="addevent-card">
          <div className="addevent-success">
            <div className="addevent-success-icon">✓</div>
            <h2 className="addevent-title">Event Submitted!</h2>
            <p className="addevent-success-msg">
              Thank you! Your event has been submitted and is awaiting approval from an admin.
            </p>
            <button className="addevent-btn" onClick={() => setSubmitted(false)}>
              Submit Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="addevent-page">
      <div className="addevent-card">
        <h2 className="addevent-title">Submit an Event</h2>
        <p className="addevent-subtitle">
          Events are reviewed by an admin before appearing on the calendar.
        </p>

        {error && <div className="addevent-error">{error}</div>}

        <div className="addevent-field">
          <label className="addevent-label">Title *</label>
          <input
            className="addevent-input"
            type="text"
            placeholder="e.g. BSL Social Evening"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>

        <div className="addevent-field">
          <label className="addevent-label">Description</label>
          <textarea
            className="addevent-input addevent-textarea"
            placeholder="A short description of the event..."
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>

        <div className="addevent-field">
          <label className="addevent-label">Location</label>
          <input
            className="addevent-input"
            type="text"
            placeholder="e.g. Edinburgh Central Library"
            value={location}
            onChange={e => setLocation(e.target.value)}
          />
        </div>

        <div className="addevent-row">
          <div className="addevent-field">
            <label className="addevent-label">Starts At *</label>
            <input
              className="addevent-input"
              type="datetime-local"
              value={startsAt}
              onChange={e => setStartsAt(e.target.value)}
            />
          </div>

          <div className="addevent-field">
            <label className="addevent-label">Finishes At</label>
            <input
              className="addevent-input"
              type="datetime-local"
              value={finishesAt}
              onChange={e => setFinishesAt(e.target.value)}
            />
          </div>
        </div>

        <button className="addevent-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? "Submitting…" : "Submit Event"}
        </button>
      </div>
    </div>
  );
}