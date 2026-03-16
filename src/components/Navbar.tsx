import { useState } from "react";
import type { View } from "../utils/views";
import "./Navbar.css";

type Props = {
  currentView: View;
  isLoggedIn: boolean;
  pendingCount: number;
  onNavigate: (view: View) => void;
  onLogout: () => void;
};

export default function Navbar({
  currentView,
  isLoggedIn,
  pendingCount,
  onNavigate,
  onLogout,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  function navigate(view: View) {
    onNavigate(view);
    setMenuOpen(false);
  }

  function logout() {
    onLogout();
    setMenuOpen(false);
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">Edinburgh BSL Community</div>

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
        <button
          className={`navbar-link ${currentView === "calendar" ? "navbar-link--active" : ""}`}
          onClick={() => navigate("calendar")}
        >
          Calendar
        </button>

        <button
          className={`navbar-link ${currentView === "contact" ? "navbar-link--active" : ""}`}
          onClick={() => navigate("contact")}
        >
          Contact
        </button>

        {isLoggedIn ? (
          <>
            <button
              className={`navbar-link navbar-link--queue ${currentView === "admin-queue" ? "navbar-link--active" : ""}`}
              onClick={() => navigate("admin-queue")}
            >
              Pending Events
              {pendingCount > 0 && (
                <span className="navbar-pending-badge">{pendingCount}</span>
              )}
            </button>
            <button className="navbar-link navbar-link--logout" onClick={logout}>
              Log out
            </button>
          </>
        ) : (
          <button
            className={`navbar-link ${currentView === "login" ? "navbar-link--active" : ""}`}
            onClick={() => navigate("login")}
          >
            Admin Login
          </button>
        )}
      </div>
    </nav>
  );
}