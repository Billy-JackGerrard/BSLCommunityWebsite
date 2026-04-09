import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import "./Login.css";

type Screen = "login" | "signup" | "signup-sent" | "forgot" | "forgot-sent" | "reset" | "reset-done";

type Props = {
  onLogin: () => void;
  initialScreen?: Screen;
};

export default function Login({ onLogin, initialScreen }: Props) {
  const [screen, setScreen] = useState<Screen>(initialScreen ?? "login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const clearError = () => setError(null);

  // When the user clicks the reset link in their email, Supabase fires
  // PASSWORD_RECOVERY. We listen here so the reset screen appears automatically.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event) => {
      if (_event === "PASSWORD_RECOVERY") setScreen("reset");
    });
    return () => subscription.unsubscribe();
  }, []);

  // ── Sign up ────────────────────────────────────────────────────────────────

  const handleSignUp = async () => {
    if (!displayName.trim()) { setError("Please enter a display name."); return; }
    if (!email.trim()) { setError("Please enter your email."); return; }
    if (!password) { setError("Please enter a password."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setLoading(true);
    clearError();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName.trim() } },
    });
    if (error) setError(error.message);
    else setScreen("signup-sent");
    setLoading(false);
  };

  // ── Google OAuth ───────────────────────────────────────────────────────────

  const handleGoogleSignIn = async () => {
    setLoading(true);
    clearError();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) { setError(error.message); setLoading(false); }
    // On success the browser redirects — no further action needed here
  };

  // ── Login ──────────────────────────────────────────────────────────────────

  const handleLogin = async () => {
    setLoading(true);
    clearError();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    else onLogin();
    setLoading(false);
  };

  // ── Forgot password ────────────────────────────────────────────────────────

  const handleSendReset = async () => {
    if (!email.trim()) { setError("Please enter your email address."); return; }
    setLoading(true);
    clearError();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    if (error) setError(error.message);
    else setScreen("forgot-sent");
    setLoading(false);
  };

  // ── Reset password (after clicking email link) ─────────────────────────────

  const handleSavePassword = async () => {
    if (!newPassword) { setError("Please enter a new password."); return; }
    if (newPassword.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (newPassword !== confirmPassword) { setError("Passwords don't match."); return; }
    setLoading(true);
    clearError();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) setError(error.message);
    else setScreen("reset-done");
    setLoading(false);
  };

  // ── Screens ────────────────────────────────────────────────────────────────

  if (screen === "signup") {
    return (
      <div className="login-page">
        <div className="page-card login-card">
          <h2 className="login-title">Create Account</h2>
          <p className="login-hint">Join to add and manage your own events.</p>
          {error && <div className="form-error" role="alert">{error}</div>}
          <div className="form-field">
            <label htmlFor="signup-name" className="form-label">Display name</label>
            <input
              id="signup-name"
              className="form-input"
              type="text"
              placeholder="e.g. Alex Smith"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="form-field">
            <label htmlFor="signup-email" className="form-label">Email</label>
            <input
              id="signup-email"
              className="form-input"
              type="email"
              placeholder="e.g. alex@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div className="form-field">
            <label htmlFor="signup-password" className="form-label">Password</label>
            <input
              id="signup-password"
              className="form-input"
              type="password"
              placeholder="At least 8 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSignUp()}
            />
          </div>
          <button className="btn-primary" onClick={handleSignUp} disabled={loading}>
            {loading ? (
              <span className="btn-loading">
                <span className="btn-spinner" aria-hidden="true" />
                Creating account…
              </span>
            ) : "Create Account"}
          </button>
          <div className="login-divider"><span>or</span></div>
          <button className="login-oauth-btn" onClick={handleGoogleSignIn} disabled={loading} type="button">
            <svg className="login-oauth-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
          <button className="login-back-btn" onClick={() => { clearError(); setScreen("login"); }}>
            Already have an account? Sign in
          </button>
        </div>
      </div>
    );
  }

  if (screen === "signup-sent") {
    return (
      <div className="login-page">
        <div className="page-card login-card">
          <div className="login-success-body">
            <div className="login-success-icon">✉</div>
            <h2 className="login-title">Check Your Email</h2>
            <p className="login-success-text">
              We've sent a confirmation link to{" "}
              <strong>{email}</strong>.
              Click it to activate your account, then sign in.
            </p>
            <button className="btn-primary" onClick={() => { clearError(); setScreen("login"); }}>
              Go to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (screen === "forgot") {
    return (
      <div className="login-page">
        <div className="page-card login-card">
          <h2 className="login-title">Reset Password</h2>
          <p className="login-hint">
            Enter your email and we'll send you a reset link.
          </p>
          {error && <div className="form-error" role="alert">{error}</div>}
          <div className="form-field">
            <label htmlFor="forgot-email" className="form-label">Email</label>
            <input
              id="forgot-email"
              className="form-input"
              type="email"
              placeholder="e.g. alex@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSendReset()}
              autoFocus
            />
          </div>
          <button className="btn-primary" onClick={handleSendReset} disabled={loading}>
            {loading ? (
              <span className="btn-loading">
                <span className="btn-spinner" aria-hidden="true" />
                Sending…
              </span>
            ) : "Send Reset Link"}
          </button>
          <button className="login-back-btn" onClick={() => { clearError(); setScreen("login"); }}>
            ← Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  if (screen === "forgot-sent") {
    return (
      <div className="login-page">
        <div className="page-card login-card">
          <div className="login-success-body">
            <div className="login-success-icon">✉</div>
            <h2 className="login-title">Check Your Email</h2>
            <p className="login-success-text">
              If an account exists for{" "}
              <strong>{email}</strong>,
              a reset link has been sent. Check your inbox.
            </p>
            <button className="btn-primary" onClick={() => { clearError(); setScreen("login"); }}>
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (screen === "reset") {
    return (
      <div className="login-page">
        <div className="page-card login-card">
          <h2 className="login-title">New Password</h2>
          <p className="login-hint">
            Choose a new password for your account.
          </p>
          {error && <div className="form-error" role="alert">{error}</div>}
          <div className="form-field">
            <label htmlFor="reset-password" className="form-label">New Password</label>
            <input
              id="reset-password"
              className="form-input"
              type="password"
              placeholder="At least 8 characters"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              autoFocus
            />
          </div>
          <div className="form-field">
            <label htmlFor="reset-confirm" className="form-label">Confirm Password</label>
            <input
              id="reset-confirm"
              className="form-input"
              type="password"
              placeholder="Repeat your new password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSavePassword()}
            />
          </div>
          <button className="btn-primary" onClick={handleSavePassword} disabled={loading}>
            {loading ? (
              <span className="btn-loading">
                <span className="btn-spinner" aria-hidden="true" />
                Saving…
              </span>
            ) : "Save New Password"}
          </button>
        </div>
      </div>
    );
  }

  if (screen === "reset-done") {
    return (
      <div className="login-page">
        <div className="page-card login-card">
          <div className="login-success-body">
            <div className="login-success-icon">✓</div>
            <h2 className="login-title">Password Updated</h2>
            <p className="login-success-text">
              Your password has been changed successfully.
            </p>
            <button className="btn-primary" onClick={onLogin}>
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Default: sign-in screen ────────────────────────────────────────────────

  return (
    <div className="login-page">
      <div className="page-card login-card">
        <h2 className="login-title">Sign In</h2>
        {error && <div className="form-error" role="alert">{error}</div>}
        <div className="form-field">
          <label htmlFor="login-email" className="form-label">Email</label>
          <input
            id="login-email"
            className="form-input"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoFocus
          />
        </div>
        <div className="form-field">
          <label htmlFor="login-password" className="form-label">Password</label>
          <input
            id="login-password"
            className="form-input"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
          />
        </div>
        <button className="btn-primary" onClick={handleLogin} disabled={loading}>
          {loading ? (
            <span className="btn-loading">
              <span className="btn-spinner" aria-hidden="true" />
              Signing in…
            </span>
          ) : "Sign In"}
        </button>
        <div className="login-divider"><span>or</span></div>
        <button className="login-oauth-btn" onClick={handleGoogleSignIn} disabled={loading} type="button">
          <svg className="login-oauth-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>
        <div className="login-toggle-row">
          <button className="login-back-btn" onClick={() => { clearError(); setScreen("forgot"); }}>
            Forgot your password?
          </button>
          <button className="login-back-btn" onClick={() => { clearError(); setScreen("signup"); }}>
            Create an account
          </button>
        </div>
      </div>
    </div>
  );
}
