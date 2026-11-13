"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowRight, KeyRound } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { getSupabaseBrowser } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const { user, ready } = useAuth();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    try {
      const supabase = getSupabaseBrowser();
      if (!supabase) throw new Error("Cloud authentication is not configured.");
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setMessage("Password updated. You can now use your new password."); setPassword("");
    } catch (e) { setError(e instanceof Error ? e.message : "Password update failed."); }
    finally { setBusy(false); }
  };
  return <div className="shell sub-page account-guest"><span className="section-kicker">ACCOUNT SECURITY / KIROKU</span><h1>NEW <em>CHAPTER.</em></h1><p>Choose a new password for your account.</p>{ready && user ? <form className="auth-form reset-form" onSubmit={submit}><label><span>NEW PASSWORD</span><div><KeyRound size={18}/><input type="password" required minLength={6} autoComplete="new-password" placeholder="New password" value={password} onChange={e => setPassword(e.target.value)}/></div></label><button disabled={busy} className="btn-primary" type="submit">{busy ? "Updating..." : "Update password"}<ArrowRight size={17}/></button></form> : <p>Open the recovery link from your email to continue.</p>}{error && <p className="auth-alert" role="alert">{error}</p>}{message && <p className="auth-success" role="status">{message}</p>}<Link href="/auth" className="account-text-link">Back to sign in</Link></div>;
}
