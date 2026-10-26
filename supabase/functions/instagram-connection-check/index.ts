// Diagnóstico de leitura da Instagram API; não publica conteúdos.
// Acesso reservado a chamadas servidor-servidor com credencial privilegiada.
Deno.serve(async (req: Request) => {
  const response = (body: Record<string, unknown>, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
    });
  if (req.method !== "POST") return response({ error: "method_not_allowed" }, 405);
  const adminKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!adminKey || req.headers.get("authorization") !== "Bearer " + adminKey)
    return response({ error: "forbidden" }, 403);
  const token = Deno.env.get("INSTAGRAM_ACCESS_TOKEN");
  if (!token) return response({ ok: false, status: "missing_secret" }, 503);
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8500);
    let remote: Response;
    try {
      remote = await fetch(
        "https://graph.instagram.com/v26.0/me?fields=user_id,username",
        { headers: { authorization: "Bearer " + token }, signal: controller.signal },
      );
    } finally {
      clearTimeout(timer);
    }
    if (!remote.ok) {
      // Não devolver tokens nem dados completos dos erros da Meta.
      return response({ ok: false, status: "meta_rejected", http_status: remote.status }, 502);
    }
    const data: Record<string, unknown> = await remote.json();
    const username = typeof data.username === "string" ? data.username : null;
    return response({ ok: username === "jingolokelaparatodos", status: "connection_checked",
      matches_expected_account: username === "jingolokelaparatodos" });
  } catch {
    return response({ ok: false, status: "network_unavailable" }, 502);
  }
});
