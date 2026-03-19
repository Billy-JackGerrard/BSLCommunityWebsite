import { useState } from "react";
import type { View } from "../utils/views";
import "./Navbar.css";

type Props = {
  currentView: View;
  isLoggedIn: boolean;
  pendingCount: number;
  messagesCount: number;
  adminName?: string | null;
  onNavigate: (view: View) => void;
  showCalendarControls?: boolean;
  onScrollToToday?: () => void;
  onToggleSearch?: () => void;
};

export default function Navbar({
  currentView,
  isLoggedIn,
  pendingCount,
  messagesCount,
  adminName,
  onNavigate,
  showCalendarControls,
  onScrollToToday,
  onToggleSearch,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  function navigate(view: View) {
    onNavigate(view);
    setMenuOpen(false);
  }

  return (
    <nav className="navbar">
      <button className="navbar-brand" onClick={() => navigate("home")} type="button">
        <img className="navbar-logo-icon" src="https://img.icons8.com/emoji/48/love-you-gesture-emoji.png" alt="love-you-gesture-emoji" width="32" height="32" />
        <span className="navbar-brand-text">
          Edinburgh BSL <span className="navbar-brand-sub">Community</span>
        </span>
      </button>

      {showCalendarControls && (
        <button className="navbar-calendar-btn navbar-today--mobile" onClick={onScrollToToday}>Today</button>
      )}

      <button
        className={`navbar-hamburger${menuOpen ? " navbar-hamburger--open" : ""}`}
        onClick={() => setMenuOpen(o => !o)}
        aria-label="Toggle menu"
        aria-expanded={menuOpen}
      >
        <span />
        <span />
        <span />
      </button>

      <div className={`navbar-links${menuOpen ? " navbar-links--open" : ""}`}>
        {showCalendarControls && (
          <div className="navbar-controls-group">
            <button className="navbar-link navbar-link--desktop-only" onClick={() => { setMenuOpen(false); onScrollToToday?.(); }}>Today</button>
            <button className="navbar-link" onClick={() => { setMenuOpen(false); onToggleSearch?.(); }}>Search</button>
          </div>
        )}

        {/* Primary CTA — replaces Calendar/List/Map on mobile */}
        <button
          className={`navbar-link navbar-link--browse ${["calendar", "list", "map"].includes(currentView) ? "navbar-link--active" : ""}`}
          onClick={() => navigate("calendar")}
        >
          Browse Events
        </button>

        <button
          className={`navbar-link navbar-link--desktop-nav ${currentView === "home" ? "navbar-link--active" : ""}`}
          onClick={() => navigate("home")}
        >
          Home
        </button>

        <button
          className={`navbar-link navbar-link--desktop-nav ${currentView === "calendar" ? "navbar-link--active" : ""}`}
          onClick={() => navigate("calendar")}
        >
          Calendar
        </button>

        <button
          className={`navbar-link navbar-link--desktop-nav ${currentView === "list" ? "navbar-link--active" : ""}`}
          onClick={() => navigate("list")}
        >
          List
        </button>

        <button
          className={`navbar-link navbar-link--desktop-nav ${currentView === "map" ? "navbar-link--active" : ""}`}
          onClick={() => navigate("map")}
        >
          Map
        </button>

        <button
          className={`navbar-link navbar-link--submit ${currentView === "add-event" ? "navbar-link--active" : ""}`}
          onClick={() => navigate("add-event")}
        >
          Submit Event
        </button>

        {!isLoggedIn && (
          <button
            className={`navbar-link ${currentView === "contact" ? "navbar-link--active" : ""}`}
            onClick={() => navigate("contact")}
          >
            Contact
          </button>
        )}

        {/* Admin section — separated on mobile */}
        {isLoggedIn && <div className="navbar-admin-divider" />}

        {isLoggedIn && (
          <button
            className={`navbar-link navbar-link--messages ${currentView === "admin-messages" ? "navbar-link--active" : ""}`}
            onClick={() => navigate("admin-messages")}
          >
            Messages
            {messagesCount > 0 && (
              <span className="navbar-pending-badge">{messagesCount}</span>
            )}
          </button>
        )}

        {isLoggedIn && (
          <button
            className={`navbar-link navbar-link--queue ${currentView === "admin-queue" ? "navbar-link--active" : ""}`}
            onClick={() => navigate("admin-queue")}
          >
            Pending Events
            {pendingCount > 0 && (
              <span className="navbar-pending-badge">{pendingCount}</span>
            )}
          </button>
        )}

        {isLoggedIn ? (
          <button
            className={`navbar-link navbar-link--account ${currentView === "account" ? "navbar-link--active" : ""}`}
            onClick={() => navigate("account")}
          >
            {adminName ?? "Account"}
          </button>
        ) : (
          <button
            className={`navbar-link navbar-link--subtle ${currentView === "login" ? "navbar-link--active" : ""}`}
            onClick={() => navigate("login")}
          >
            Admin Login
          </button>
        )}
      </div>
    </nav>
  );
}
