export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  try {
    const { audioBase64, audioMimeType = 'audio/webm' } = req.body
    const ELEVEN_KEY = process.env.ELEVENLABS_API_KEY
    if (!ELEVEN_KEY) return res.status(500).json({ error: 'No ElevenLabs key' })
    if (!audioBase64) return res.status(400).json({ error: 'audioBase64 is required' })

    const buffer = Buffer.from(audioBase64, 'base64')
    const blob = new Blob([buffer], { type: audioMimeType })

    const form = new FormData()
    form.append('name', `revenio_user_${Date.now()}`)
    form.append('files', blob, 'recording.webm')

    const response = await fetch('https://api.elevenlabs.io/v1/voices/add', {
      method: 'POST',
      headers: { 'xi-api-key': ELEVEN_KEY },
      body: form,
    })

    if (!response.ok) {
      const err = await response.text()
      return res.status(500).json({ error: err })
    }

    const data = await response.json()
    return res.status(200).json({ voiceId: data.voice_id })
  } catch (e: any) {
    return res.status(500).json({ error: e.message })
  }
}
