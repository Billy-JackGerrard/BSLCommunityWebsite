import { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabaseClient";
import { deduplicateByRecurrence } from "../utils/recurrence";

/**
 * Manages authentication state, user identity, role, and badge counts.
 */
export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [adminName, setAdminName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [messagesCount, setMessagesCount] = useState(0);

  const fetchMessagesCount = useCallback(async () => {
    const { count, error } = await supabase
      .from("contact_messages")
      .select("id", { count: "exact", head: true });
    if (!error) setMessagesCount(count ?? 0);
  }, []);

  const fetchPendingCount = useCallback(async () => {
    const { data, error } = await supabase
      .from("events")
      .select("id, recurrence")
      .eq("approved", false);

    if (error || !data) { setPendingCount(0); return; }
    setPendingCount(deduplicateByRecurrence(data).length);
  }, []);

  useEffect(() => {
    const applySession = async (session: { user: { id: string; email?: string; user_metadata?: Record<string, unknown> } } | null) => {
      if (!session) {
        setIsLoggedIn(false);
        setIsAdmin(false);
        setUserId(null);
        setUserEmail(null);
        setAdminName(null);
        setPendingCount(0);
        setMessagesCount(0);
        setIsAuthLoading(false);
        return;
      }

      setIsLoggedIn(true);
      setUserId(session.user.id);
      setUserEmail(session.user.email ?? null);
      setAdminName((session.user.user_metadata?.display_name as string) ?? null);

      // Fetch role from profiles table
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin, display_name")
        .eq("user_id", session.user.id)
        .single();

      const adminFlag = profile?.is_admin ?? false;
      setIsAdmin(adminFlag);

      // Override display_name from profile if available (covers OAuth users)
      if (profile?.display_name) {
        setAdminName(profile.display_name);
      }

      if (adminFlag) {
        fetchPendingCount().catch(console.error);
        fetchMessagesCount().catch(console.error);
      } else {
        setPendingCount(0);
        setMessagesCount(0);
      }

      setIsAuthLoading(false);
    };

    supabase.auth.getSession()
      .then(({ data: { session } }) => applySession(session))
      .catch(err => { console.error(err); setIsAuthLoading(false); });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      applySession(session).catch(console.error);
    });

    return () => subscription.unsubscribe();
  }, [fetchPendingCount, fetchMessagesCount]);

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    // onAuthStateChange fires with null session and clears all state automatically
  }, []);

  return {
    isLoggedIn,
    isAdmin,
    isAuthLoading,
    userId,
    adminName,
    userEmail,
    pendingCount,
    setPendingCount,
    messagesCount,
    setMessagesCount,
    fetchPendingCount,
    handleLogout,
  };
}
