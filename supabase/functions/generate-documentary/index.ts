import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  try {
    const { narrationText, personName, scenes, userPhotoBase64, userPhotoMediaType } = await req.json()
    const RUNWAY_KEY = Deno.env.get('RUNWAY_API_KEY')
    const ELEVEN_KEY = Deno.env.get('ELEVENLABS_API_KEY')

    const elevenRes = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'xi-api-key': ELEVEN_KEY! },
      body: JSON.stringify({
        text: narrationText,
        model_id: 'eleven_monolingual_v1',
        voice_settings: { stability: 0.5, similarity_boost: 0.75 }
      })
    })
    const audioBuffer = await elevenRes.arrayBuffer()
    const audioBase64 = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)))

    const videoTaskIds: string[] = []
    for (const scene of scenes) {
      const body: any = {
        model: 'gen4_turbo',
        promptText: scene.visualPrompt,
        duration: 10,
        ratio: '1280:720',
      }
      if (userPhotoBase64) {
        body.promptImage = `data:${userPhotoMediaType};base64,${userPhotoBase64}`
      }
      const runwayRes = await fetch('https://api.dev.runwayml.com/v1/image_to_video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RUNWAY_KEY}`,
          'X-Runway-Version': '2024-11-06',
        },
        body: JSON.stringify(body)
      })
      const runwayData = await runwayRes.json()
      if (runwayData.id) videoTaskIds.push(runwayData.id)
    }

    return new Response(JSON.stringify({ audioBase64, videoTaskIds, success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
