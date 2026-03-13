import './style.css'

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Calendar from "./components/calendar.tsx";

createRoot(document.getElementById("app")!).render(
  <StrictMode>
    <Calendar />
  </StrictMode>
);