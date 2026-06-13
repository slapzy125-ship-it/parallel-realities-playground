export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  try {
    const { text } = req.body
    const ELEVEN_KEY = process.env.ELEVENLABS_API_KEY
    if (!ELEVEN_KEY) return res.status(500).json({ error: 'No ElevenLabs key' })

    const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'xi-api-key': ELEVEN_KEY },
      body: JSON.stringify({
        text: text.slice(0, 500),
        model_id: 'eleven_monolingual_v1',
        voice_settings: { stability: 0.6, similarity_boost: 0.8 }
      })
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('ElevenLabs error:', response.status, err)
      return res.status(500).json({ error: err })
    }

    const buffer = Buffer.from(await response.arrayBuffer())
    const base64 = buffer.toString('base64')
    return res.status(200).json({ audioBase64: base64 })
  } catch(e: any) {
    console.error('Narrate error:', e)
    return res.status(500).json({ error: e.message })
  }
}
