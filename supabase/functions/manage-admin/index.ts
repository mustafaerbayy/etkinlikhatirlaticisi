import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify caller is admin
    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user: caller } } = await anonClient.auth.getUser();
    if (!caller) throw new Error("Unauthorized");

    const { data: isCallerAdmin } = await supabaseAdmin.rpc("has_role", { _user_id: caller.id, _role: "admin" });
    if (!isCallerAdmin) throw new Error("Forbidden: not an admin");

    const { action, email, user_id } = await req.json();

    if (action === "list") {
      // Get all admin roles with user info
      const { data: roles } = await supabaseAdmin.from("user_roles").select("user_id, role").eq("role", "admin");
      // Get announcement_admin roles
      const { data: annRoles } = await supabaseAdmin.from("user_roles").select("user_id").eq("role", "announcement_admin");
      const annAdminIds = new Set((annRoles || []).map(r => r.user_id));

      if (!roles?.length) return new Response(JSON.stringify({ admins: [] }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

      const { data: { users } } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
      const admins = roles.map(r => {
        const u = users?.find(u => u.id === r.user_id);
        return u ? { id: u.id, email: u.email, first_name: u.user_metadata?.first_name || "", last_name: u.user_metadata?.last_name || "", has_announcement_access: annAdminIds.has(r.user_id) } : null;
      }).filter(Boolean);

      return new Response(JSON.stringify({ admins }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "add") {
      if (!email) throw new Error("Email is required");
      const { data: { users } } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
      const targetUser = users?.find(u => u.email === email);
      if (!targetUser) throw new Error("Bu e-posta ile kayıtlı kullanıcı bulunamadı");

      const { error } = await supabaseAdmin.from("user_roles").insert({ user_id: targetUser.id, role: "admin" });
      if (error) {
        if (error.code === "23505") throw new Error("Bu kullanıcı zaten admin");
        throw error;
      }
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "remove") {
      if (!user_id) throw new Error("user_id is required");
      if (user_id === caller.id) throw new Error("Kendinizi admin listesinden çıkaramazsınız");

      const { error } = await supabaseAdmin.from("user_roles").delete().eq("user_id", user_id).eq("role", "admin");
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "toggle_announcement") {
      if (!user_id) throw new Error("user_id is required");
      // Check if user already has announcement_admin role
      const { data: existing } = await supabaseAdmin.from("user_roles").select("id").eq("user_id", user_id).eq("role", "announcement_admin").maybeSingle();
      if (existing) {
        await supabaseAdmin.from("user_roles").delete().eq("id", existing.id);
      } else {
        await supabaseAdmin.from("user_roles").insert({ user_id, role: "announcement_admin" });
      }
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    throw new Error("Invalid action");
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
