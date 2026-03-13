import './style.css'
import './components/Navbar.css'

import { StrictMode, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { supabase } from "./supabaseClient";
import Calendar from "./components/calendar.tsx";
import Login from "./components/login.tsx";
import Navbar from "./components/navbar.tsx";

type View = "calendar" | "login" | "add-event";

function App() {
  const [view, setView] = useState<View>("calendar");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check auth state on load
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
      if (!session) setView("calendar"); // redirect on logout
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
    setView("calendar");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setView("calendar");
  };

  return (
    <>
      <Navbar
        currentView={view}
        isLoggedIn={isLoggedIn}
        onNavigate={setView}
        onLogout={handleLogout}
      />
      <div style={{ paddingTop: "60px" }}>
        {view === "calendar" && <Calendar />}
        {view === "login" && <Login onLogin={handleLogin} />}
        {view === "add-event" && isLoggedIn && <Calendar />}
      </div>
    </>
  );
}

createRoot(document.getElementById("app")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);