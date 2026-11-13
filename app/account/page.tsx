"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowRight, BookmarkCheck, Cloud, LogOut, UserRound } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { useLibrary } from "@/components/library-provider";
import { getSupabaseBrowser, supabaseConfigured } from "@/lib/supabase/client";

export default function AccountPage() {
  const { user, ready, signOut } = useAuth();
  const { entries, guestCount, importGuest, busy, cloud, error: libraryError } = useLibrary();
  const [name, setName] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (!user) return;
    const supabase = getSupabaseBrowser();
    supabase?.from("profiles").select("display_name").eq("id", user.id).single().then(({ data, error }) => {
      if (error) setError(`Profile unavailable: ${error.message}`);
      else if (data?.display_name) setName(data.display_name);
    });
  }, [user]);

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    setSaving(true); setNotice(""); setError("");
    try {
      const { error } = await getSupabaseBrowser()!.from("profiles").update({ display_name: name.trim() }).eq("id", user.id);
      if (error) throw error;
      setNotice("Your profile has been updated.");
    } catch (e) { setError(e instanceof Error ? e.message : "Couldn't save your profile."); }
    finally { setSaving(false); }
  };

  const handleImport = async () => {
    setNotice(""); setError("");
    try {
      const count = await importGuest();
      setNotice(`${count} browser titles checked. New titles were added without replacing existing cloud progress. Your original browser list was kept.`);
    } catch (e) { setError(e instanceof Error ? e.message : "Couldn't import your browser collection."); }
  };

  if (!ready) return <div className="shell sub-page"><p>Loading account...</p></div>;
  if (!user || !supabaseConfigured) return <div className="shell sub-page account-guest"><span className="section-kicker">YOUR ACCOUNT / KIROKU</span><h1>MAKE IT <em>YOURS.</em></h1><p>Create an account to sync your anime collection securely across devices.</p><Link href="/auth" className="btn-primary">Sign in or create account <ArrowRight size={18}/></Link></div>;
  return <div className="shell sub-page account-page">
    <div className="page-intro"><span className="section-kicker">A PERSONAL ARCHIVE / KIROKU</span><h1>YOUR <em>ACCOUNT.</em></h1><p>Every story saved, wherever you watch.</p></div>
    <div className="account-grid">
      <section className="account-panel"><div className="account-panel-heading"><UserRound size={24}/><h2>Profile</h2></div><p className="account-email">{user.email}</p><form onSubmit={saveProfile} className="auth-form"><label><span>DISPLAY NAME</span><div><UserRound size={18}/><input required maxLength={50} value={name} onChange={e => setName(e.target.value)} placeholder="Your name"/></div></label><button className="btn-primary" type="submit" disabled={saving || !name.trim()}>{saving ? "Saving..." : "Save profile"}<ArrowRight size={17}/></button></form>
        <button className="account-signout" onClick={async () => { try { await signOut(); } catch(e) { setError(e instanceof Error ? e.message : "Sign-out failed."); } }}><LogOut size={17}/> Sign out</button>
      </section>
      <section className="account-panel"><div className="account-panel-heading"><Cloud size={24}/><h2>Cloud collection</h2></div><p className="account-description">Your account owns a private library, protected by Supabase Row Level Security.</p><div className="account-stat"><BookmarkCheck size={25}/><strong>{cloud ? entries.length : 0}</strong><span>saved anime</span></div><Link href="/library" className="account-text-link">View cloud collection <ArrowRight size={17}/></Link>
        {guestCount > 0 && <div className="import-box"><strong>Import your existing browser list</strong><p>{guestCount} titles saved on this browser. Importing adds missing titles only; existing cloud progress is preserved.</p><button className="btn-primary" type="button" onClick={handleImport} disabled={busy}>{busy ? "Importing..." : "Import browser titles"}<ArrowRight size={16}/></button></div>}
      </section>
    </div>
    {notice && <div className="auth-success" role="status">{notice}</div>}
    {(error || libraryError) && <div className="auth-alert" role="alert">{error || libraryError}</div>}
  </div>;
}
