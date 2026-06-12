export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  const { narrationText, scenes, userPhotoBase64, userPhotoMediaType } = req.body
  const ELEVEN_KEY = process.env.ELEVENLABS_API_KEY
  const RUNWAY_KEY = process.env.RUNWAY_API_KEY
  const elevenRes = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'xi-api-key': ELEVEN_KEY! },
    body: JSON.stringify({ text: narrationText, model_id: 'eleven_monolingual_v1', voice_settings: { stability: 0.5, similarity_boost: 0.75 } })
  })

  if (!elevenRes.ok) {
    const errorText = await elevenRes.text()
    console.log('ElevenLabs error:', elevenRes.status, errorText)
    return res.status(500).json({ error: 'ElevenLabs failed', status: elevenRes.status, details: errorText.slice(0, 300) })
  }

  const audioBuffer = await elevenRes.arrayBuffer()
  const audioBase64 = Buffer.from(audioBuffer).toString('base64')
  const videoTaskIds: string[] = []
  for (const scene of scenes) {
    const body: any = { model: 'gen4_turbo', promptText: scene.visualPrompt, duration: 10, ratio: '1280:720' }
    if (userPhotoBase64) body.promptImage = `data:${userPhotoMediaType};base64,${userPhotoBase64}`
    const runwayRes = await fetch('https://api.dev.runwayml.com/v1/image_to_video', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${RUNWAY_KEY}`, 'X-Runway-Version': '2024-11-06' },
      body: JSON.stringify(body)
    })
    const runwayData = await runwayRes.json()
    if (runwayData.id) videoTaskIds.push(runwayData.id)
  }
  return res.status(200).json({ audioBase64, videoTaskIds, success: true })
}
