import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const FREE_WORLDS = new Set(['arcane', 'champions', 'parallel'])
const IMMORTAL_WORLDS = new Set(['rift'])
const NO_CAP_WORLDS = new Set(['parallel']) // tier-gated client-side
const ALLOWED_WORLDS = new Set([
  'arcane', 'champions', 'galactic', 'dragonfall', 'shadow',
  'neon', 'odyssey', 'hero', 'rift', 'parallel',
])
const FREE_SCENE_CAP = 5

// Hard limits to prevent abuse / cost inflation
const MAX_TOTAL_BODY_BYTES = 200_000        // ~200KB total request
const MAX_SYSTEM_CHARS = 20_000
const MAX_MESSAGES = 24
const MAX_MESSAGE_CHARS = 8_000

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const apiKey = Deno.env.get('LOVABLE_API_KEY')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!apiKey || !supabaseUrl || !serviceKey) {
      return json({ error: 'Server not configured' }, 500)
    }

    // ── Server-side auth check ─────────────────────────────────────────
    const authHeader = req.headers.get('Authorization') ?? ''
    const token = authHeader.replace(/^Bearer\s+/i, '').trim()
    if (!token) return json({ error: 'Sign in required to play.' }, 401)

    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const { data: userResp, error: userErr } = await admin.auth.getUser(token)
    if (userErr || !userResp?.user) return json({ error: 'Invalid session.' }, 401)
    const userId = userResp.user.id

    // ── Read + size-cap the body ───────────────────────────────────────
    const rawBody = await req.text()
    if (rawBody.length > MAX_TOTAL_BODY_BYTES) {
      return json({ error: 'Request too large.' }, 413)
    }
    let body: any
    try {
      body = JSON.parse(rawBody)
    } catch {
      return json({ error: 'Invalid request body.' }, 400)
    }

    const { system, messages, worldId, isOpening } = body as {
      system?: unknown
      messages?: unknown
      worldId?: unknown
      isOpening?: unknown
    }

    // ── Validate worldId (required, allowlisted) ───────────────────────
    if (typeof worldId !== 'string' || !ALLOWED_WORLDS.has(worldId)) {
      return json({ error: 'Invalid or missing worldId.' }, 400)
    }

    // ── Validate system prompt (size-cap only; accepted from client) ───
    let systemStr: string | undefined
    if (system !== undefined && system !== null) {
      if (typeof system !== 'string') return json({ error: 'Invalid system prompt.' }, 400)
      if (system.length > MAX_SYSTEM_CHARS) return json({ error: 'System prompt too large.' }, 400)
      systemStr = system
    }

    // ── Validate messages: array, capped count, capped length, no client system role ──
    if (!Array.isArray(messages)) return json({ error: 'Invalid messages.' }, 400)
    if (messages.length > MAX_MESSAGES) return json({ error: 'Too many messages.' }, 400)
    const cleanMessages: Array<{ role: string; content: string }> = []
    for (const m of messages) {
      if (!m || typeof m !== 'object') return json({ error: 'Invalid message entry.' }, 400)
      const role = (m as any).role
      const content = (m as any).content
      if (typeof role !== 'string' || typeof content !== 'string') {
        return json({ error: 'Invalid message entry.' }, 400)
      }
      // Strip any client-supplied system messages — only the server-controlled system is honored
      if (role === 'system') continue
      if (role !== 'user' && role !== 'assistant') continue
      if (content.length > MAX_MESSAGE_CHARS) {
        return json({ error: 'Message too long.' }, 400)
      }
      cleanMessages.push({ role, content })
    }

    // ── Server-side tier check ─────────────────────────────────────────
    const { data: tierRow } = await admin.rpc('get_user_tier', { _user_id: userId })
    let tier: 'free' | 'legend' | 'immortal' = (tierRow as any) ?? 'free'

    // Hardcoded test bypass: grant Immortal to specific tester account
    if (userResp.user.email?.toLowerCase() === 'slapzy125@gmail.com') {
      tier = 'immortal'
    }

    // ── Tier gates (now unconditional — worldId is required) ───────────
    if (IMMORTAL_WORLDS.has(worldId) && tier !== 'immortal') {
      return json({ error: 'This world is reserved for Immortal subscribers.' }, 403)
    }
    if (tier === 'free' && !FREE_WORLDS.has(worldId)) {
      return json({ error: 'This world requires a Legend subscription.' }, 403)
    }

    // Free tier: enforce 5-scene cap per world server-side
    if (tier === 'free') {
      const { data: usage } = await admin
        .from('free_scene_usage')
        .select('count')
        .eq('user_id', userId)
        .eq('world_id', worldId)
        .maybeSingle()
      const used = usage?.count ?? 0
      if (used >= FREE_SCENE_CAP) {
        return json(
          { error: 'You have reached the 5-scene free limit for this world. Upgrade to Legend to continue.', paywall: true },
          403,
        )
      }
    }

    // ── Call Lovable AI Gateway ────────────────────────────────────────
    const chatMessages = [
      ...(systemStr ? [{ role: 'system', content: systemStr }] : []),
      ...cleanMessages,
    ]

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Lovable-API-Key': apiKey },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: chatMessages,
      }),
    })

    if (!response.ok) {
      const text = await response.text()
      console.error(`AI gateway error ${response.status}: ${text}`)
      return json({ error: 'AI service temporarily unavailable. Please try again.' }, 502)
    }

    const data = await response.json()
    const text = data.choices?.[0]?.message?.content ?? ''

    // ── Increment scene usage for free tier ────────────────────────────
    if (tier === 'free' && !isOpening) {
      const { data: existing } = await admin
        .from('free_scene_usage')
        .select('count')
        .eq('user_id', userId)
        .eq('world_id', worldId)
        .maybeSingle()
      const newCount = (existing?.count ?? 0) + 1
      await admin
        .from('free_scene_usage')
        .upsert(
          { user_id: userId, world_id: worldId, count: newCount, updated_at: new Date().toISOString() },
          { onConflict: 'user_id,world_id' },
        )
    }

    return json({ content: [{ type: 'text', text }], tier })
  } catch (error) {
    console.error('ai-scene unhandled error:', error)
    return json({ error: 'An internal error occurred. Please try again.' }, 500)
  }
})
