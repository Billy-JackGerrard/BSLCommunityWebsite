import './style.css'

import { StrictMode, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { supabase } from "./supabaseClient";
import Calendar from "./components/Calendar.tsx";
import Login from "./components/Login.tsx";
import Navbar from "./components/Navbar.tsx";
import AddEvent from "./components/events/AddEvent.tsx";
import EditEvent from "./components/events/EditEvent.tsx";
import AdminQueue from "./components/events/AdminQueue.tsx";
import Contact from "./components/Contact.tsx";
import type { Event, View } from "./utils/types.ts";

function App() {
  const [view, setView] = useState<View>("calendar");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
      if (!session) setView("calendar");
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (view === "admin-queue" && !isLoggedIn) setView("login");
    if (view === "edit-event" && !isLoggedIn) setView("calendar");
  }, [view, isLoggedIn]);

  const handleLogin = () => setView("calendar");

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setView("calendar");
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setView("edit-event");
  };

  const handleEditSaved = (updated: Event) => {
    // Return to calendar; the updated event will be refetched on next month load.
    // We stash the updated event so if the user navigates back the data is fresh.
    setEditingEvent(updated);
    setView("calendar");
  };

  const handleEditCancel = () => {
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
        {view === "calendar" && (
          <Calendar isLoggedIn={isLoggedIn} onEditEvent={handleEditEvent} />
        )}
        {view === "login"      && <Login onLogin={handleLogin} />}
        {view === "add-event"  && <AddEvent />}
        {view === "edit-event" && isLoggedIn && editingEvent && (
          <EditEvent
            event={editingEvent}
            onSaved={handleEditSaved}
            onCancel={handleEditCancel}
          />
        )}
        {view === "admin-queue" && isLoggedIn && <AdminQueue />}
        {view === "contact"    && <Contact />}
      </div>
    </>
  );
}

createRoot(document.getElementById("app")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);