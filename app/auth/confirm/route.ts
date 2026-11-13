import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const token = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const target = request.nextUrl.clone();
  target.search = "";
  target.pathname = "/auth";

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    target.searchParams.set("error", "configuration");
    return NextResponse.redirect(target);
  }
  const supabase = await createClient();
  if (token && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: token, type });
    if (!error) {
      target.pathname = type === "recovery" ? "/account/reset-password" : "/account";
      return NextResponse.redirect(target);
    }
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      target.pathname = "/account";
      return NextResponse.redirect(target);
    }
  }
  target.searchParams.set("error", "invalid_link");
  return NextResponse.redirect(target);
}
