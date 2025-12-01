import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(request) {
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

    const { data, error } =
      await supabaseAdmin.auth.admin.inviteUserByEmail(email);

    if (error) throw error;

    if (data.user) {
      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .update({ role: "admin" })
        .eq("id", data.user.id);

      if (profileError) throw profileError;
    }

    return NextResponse.json({ message: "Admin invite sent successfully!" });
  } catch (error) {
    console.error("Invite Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
