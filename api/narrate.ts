export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
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
    return res.status(500).json({ error: err })
  }
  const audioBuffer = await response.arrayBuffer()
  res.setHeader('Content-Type', 'audio/mpeg')
  res.setHeader('Content-Length', audioBuffer.byteLength)
  return res.status(200).send(Buffer.from(audioBuffer))
}
