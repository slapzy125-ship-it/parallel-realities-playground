import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const FREE_WORLDS = new Set(['arcane', 'champions'])
const IMMORTAL_WORLDS = new Set(['rift'])
const FREE_SCENE_CAP = 5

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

    const body = await req.json()
    const { system, messages, worldId, isOpening } = body as {
      system?: string
      messages?: Array<{ role: string; content: string }>
      worldId?: string
      isOpening?: boolean
    }

    // ── Server-side tier check ─────────────────────────────────────────
    const { data: tierRow } = await admin.rpc('get_user_tier', { _user_id: userId })
    let tier: 'free' | 'legend' | 'immortal' = (tierRow as any) ?? 'free'

    // Hardcoded test bypass: grant Immortal to specific tester account
    if (userResp.user.email?.toLowerCase() === 'slapzy125@gmail.com') {
      tier = 'immortal'
    }

    if (worldId) {
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
    }

    // ── Call Lovable AI Gateway ────────────────────────────────────────
    const chatMessages = [
      ...(system ? [{ role: 'system', content: system }] : []),
      ...(messages || []),
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
      return json({ error: `Gateway ${response.status}: ${text}` }, response.status)
    }

    const data = await response.json()
    const text = data.choices?.[0]?.message?.content ?? ''

    // ── Increment scene usage for free tier ────────────────────────────
    if (tier === 'free' && worldId && !isOpening) {
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
    return json({ error: (error as Error).message }, 500)
  }
})
