"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, KeyRound, LockKeyhole, Mail, UserRound } from "lucide-react";
import { getSupabaseBrowser, supabaseConfigured } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth-provider";
import { Suspense } from "react";

function AuthForm() {
  const params = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    if (params.get("mode") === "signup") setMode("signup");
    if (params.get("error")) setError("That email link expired or couldn't be verified. Please try again.");
  }, [params]);
  useEffect(() => { if (user) router.replace("/account"); }, [user, router]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true); setMessage(""); setError("");
    const client = getSupabaseBrowser();
    if (!client) { setError("Supabase hasn't been connected yet."); setBusy(false); return; }
    try {
      if (mode === "forgot") {
        const { error } = await client.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/confirm`,
        });
        if (error) throw error;
        setMessage("If this address has an account, you'll receive a password reset email.");
      } else if (mode === "signup") {
        const { data, error } = await client.auth.signUp({
          email, password,
          options: { data: { display_name: name.trim() || "Anime fan" }, emailRedirectTo: `${window.location.origin}/auth/confirm` },
        });
        if (error) throw error;
        if (!data.session) setMessage("Check your inbox to verify your email, then sign in to KIROKU.");
        else router.replace("/account");
      } else {
        const { error } = await client.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.replace("/account");
      }
    } catch (e) { setError(e instanceof Error ? e.message : "Something went wrong."); }
    finally { setBusy(false); }
  };

  const switchMode = (value: typeof mode) => { setMode(value); setMessage(""); setError(""); setPassword(""); };
  return <div className="auth-page shell">
    <section className="auth-story">
      <span className="section-kicker">A NEW CHAPTER / KIROKU</span>
      <h1>KEEP EVERY<br/><em>STORY CLOSE.</em></h1>
      <p>One account. Your own anime universe. Pick up your collection from any device.</p>
      <div className="auth-orbit" aria-hidden="true"><span>記録</span></div>
    </section>
    <section className="auth-panel">
      <span className="section-kicker">{mode === "signup" ? "JOIN THE ARCHIVE" : mode === "forgot" ? "RECOVER ACCESS" : "WELCOME BACK"}</span>
      <h2>{mode === "signup" ? "Create an account" : mode === "forgot" ? "Reset your password" : "Your story continues"}</h2>
      <p>{mode === "signup" ? "Start a collection you can carry anywhere." : mode === "forgot" ? "We'll send you a secure recovery link." : "Sign in to sync your anime collection."}</p>
      {!supabaseConfigured ? <div className="auth-alert">Cloud accounts are not configured yet. Add the two NEXT_PUBLIC_SUPABASE environment variables to your deployment.</div> : <>
        {mode !== "forgot" && <div className="auth-tabs" role="group" aria-label="Authentication mode"><button type="button" className={mode === "login" ? "active" : ""} onClick={() => switchMode("login")}>Sign in</button><button type="button" className={mode === "signup" ? "active" : ""} onClick={() => switchMode("signup")}>Create account</button></div>}
        <form className="auth-form" onSubmit={submit}>
          {mode === "signup" && <label><span>DISPLAY NAME</span><div><UserRound size={18}/><input autoComplete="nickname" maxLength={50} value={name} onChange={e => setName(e.target.value)} placeholder="Your archive name"/></div></label>}
          <label><span>EMAIL ADDRESS</span><div><Mail size={18}/><input autoComplete="email" required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"/></div></label>
          {mode !== "forgot" && <label><span>PASSWORD</span><div><LockKeyhole size={18}/><input autoComplete={mode === "signup" ? "new-password" : "current-password"} required minLength={6} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters"/></div></label>}
          {error && <p className="auth-alert" role="alert">{error}</p>}
          {message && <p className="auth-success" role="status">{message}</p>}
          <button type="submit" className="btn-primary auth-submit" disabled={busy}>{busy ? "Working..." : mode === "signup" ? "Create my account" : mode === "forgot" ? "Send reset link" : "Sign in"}<ArrowRight size={18}/></button>
        </form>
        <div className="auth-footer-links">{mode === "forgot" ? <button type="button" onClick={() => switchMode("login")}>Back to sign in</button> : <button type="button" onClick={() => switchMode("forgot")}><KeyRound size={15}/> Forgot password?</button>}<Link href="/">Continue exploring</Link></div>
      </>}
    </section>
  </div>;
}

export default function AuthPage() { return <Suspense fallback={<div className="shell sub-page">Loading sign in...</div>}><AuthForm/></Suspense>; }
