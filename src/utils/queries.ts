import { supabase } from "../supabaseClient";

/** Base query for all events. Chain .order() and date filters on top. */
export const approvedEventsQuery = () =>
  supabase.from("events").select("*");
