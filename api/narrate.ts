export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  try {
    const { text, sectionIndex = 0 } = req.body
    const ELEVEN_KEY = process.env.ELEVENLABS_API_KEY
    if (!ELEVEN_KEY) return res.status(500).json({ error: 'No ElevenLabs key' })
    const ageSettings = [
      { stability: 0.3, similarity_boost: 0.6, style: 0.8 },
      { stability: 0.4, similarity_boost: 0.65, style: 0.7 },
      { stability: 0.55, similarity_boost: 0.7, style: 0.5 },
      { stability: 0.7, similarity_boost: 0.8, style: 0.3 },
      { stability: 0.8, similarity_boost: 0.85, style: 0.2 },
      { stability: 0.88, similarity_boost: 0.9, style: 0.1 },
      { stability: 0.95, similarity_boost: 0.95, style: 0.05 },
    ]
    const settings = ageSettings[Math.min(sectionIndex, ageSettings.length - 1)]
    const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'xi-api-key': ELEVEN_KEY },
      body: JSON.stringify({
        text: text.slice(0, 300),
        model_id: 'eleven_multilingual_v2',
        voice_settings: { stability: settings.stability, similarity_boost: settings.similarity_boost, style: settings.style, use_speaker_boost: true }
      })
    })
    if (!response.ok) {
      const err = await response.text()
      return res.status(500).json({ error: err })
    }
    const buffer = Buffer.from(await response.arrayBuffer())
    const base64 = buffer.toString('base64')
    return res.status(200).json({ audioBase64: base64 })
  } catch(e: any) {
    return res.status(500).json({ error: e.message })
  }
}
