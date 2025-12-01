import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(request) {
  // 1. Setup the "God Mode" Client
  // We create this client HERE, not in lib/supabaseClient, because this key is secret.
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );

  try {
    const { email } = await request.json();

    // 2. Invite the user
    // This sends them a magic link to set their password.
    const { data, error } = await supabaseAdmin.auth.inviteUserByEmail(email);

    if (error) throw error;

    // 3. Upgrade them to Admin immediately
    // Because the trigger we made in Step 1 sets them to 'user' by default,
    // we need to manually bump them up to 'admin' now.
    if (data.user) {
      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .update({ role: "admin" })
        .eq("id", data.user.id);

      if (profileError) throw profileError;
    }

    return NextResponse.json({ message: "Admin invite sent successfully!" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
