import "./Navbar.css";

type View = "calendar" | "login" | "add-event";

type Props = {
  currentView: View;
  isLoggedIn: boolean;
  onNavigate: (view: View) => void;
  onLogout: () => void;
};

export default function Navbar({ currentView, isLoggedIn, onNavigate, onLogout }: Props) {
  return (
    <nav className="navbar">
      <div className="navbar-brand">Edinburgh BSL</div>
      <div className="navbar-links">
        <button
          className={`navbar-link ${currentView === "calendar" ? "navbar-link--active" : ""}`}
          onClick={() => onNavigate("calendar")}
        >
          Calendar
        </button>

        {isLoggedIn ? (
          <>
            <button
              className={`navbar-link ${currentView === "add-event" ? "navbar-link--active" : ""}`}
              onClick={() => onNavigate("add-event")}
            >
              Add Event
            </button>
            <button className="navbar-link navbar-link--logout" onClick={onLogout}>
              Log out
            </button>
          </>
        ) : (
          <button
            className={`navbar-link ${currentView === "login" ? "navbar-link--active" : ""}`}
            onClick={() => onNavigate("login")}
          >
            I'm an Admin
          </button>
        )}
      </div>
    </nav>
  );
}