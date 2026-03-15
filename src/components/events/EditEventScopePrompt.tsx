import "./AddEvent.css";
import "./EditEvent.css";

export type RecurringScope = "single" | "all-future";

type Props = {
  eventTitle: string;
  saving: boolean;
  error: string | null;
  onChoose: (scope: RecurringScope) => void;
  onBack: () => void;
};

export default function EditEventScopePrompt({ eventTitle, saving, error, onChoose, onBack }: Props) {
  return (
    <div className="addevent-page">
      <div className="addevent-card">
        <h2 className="addevent-title">Edit Recurring Event</h2>

        <p className="editrecur-question">
          <strong style={{ color: "var(--color-accent)" }}>{eventTitle}</strong> is part
          of a recurring series. Which occurrences do you want to update?
        </p>

        {error && <div className="addevent-error">{error}</div>}

        <div className="editrecur-choices">
          <button
            className="editrecur-choice-btn"
            onClick={() => onChoose("single")}
            disabled={saving}
          >
            <span className="editrecur-choice-title">
              {saving ? "Saving…" : "Just this event"}
            </span>
            <span className="editrecur-choice-desc">Only update this single occurrence</span>
          </button>

          <button
            className="editrecur-choice-btn editrecur-choice-btn--secondary"
            onClick={() => onChoose("all-future")}
            disabled={saving}
          >
            <span className="editrecur-choice-title">
              {saving ? "Saving…" : "This & all future events"}
            </span>
            <span className="editrecur-choice-desc">Update this occurrence and all that follow it</span>
          </button>
        </div>

        <button className="editrecur-back-btn" onClick={onBack} disabled={saving}>
          ← Back to edit
        </button>
      </div>
    </div>
  );
}