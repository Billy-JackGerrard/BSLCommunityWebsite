import { Component, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { hasError: boolean };

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        textAlign: "center",
        gap: "1.25rem",
        background: "var(--color-bg-page)",
        color: "var(--color-text-primary)",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}>
        <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <line x1="12" y1="8" x2="12" y2="12.5" />
          <circle cx="12" cy="16" r="0.5" fill="var(--color-text-muted)" />
        </svg>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <h2 style={{ margin: 0, fontSize: "1.35rem", fontWeight: 700 }}>Something went wrong</h2>
          <p style={{ margin: 0, color: "var(--color-text-muted)", maxWidth: "340px", lineHeight: "1.65", fontSize: "0.9rem" }}>
            An unexpected error occurred. Try reloading the page — if it keeps happening, let us know via the contact form.
          </p>
        </div>

        <button
          onClick={() => window.location.reload()}
          style={{
            background: "var(--color-accent)",
            color: "#ffffff",
            border: "none",
            borderRadius: "6px",
            padding: "0.6rem 1.6rem",
            fontSize: "0.9rem",
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Reload page
        </button>
      </div>
    );
  }
}
