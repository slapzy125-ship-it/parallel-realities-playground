export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const { scenes, userPhotoBase64, userPhotoMediaType } = req.body
  const RUNWAY_KEY = process.env.RUNWAY_API_KEY

  if (!RUNWAY_KEY) {
    return res.status(500).json({ error: 'RUNWAY_API_KEY not set' })
  }

  try {
    const videoTaskIds: string[] = []
    for (const scene of scenes.slice(0, 3)) {
      const body: any = {
        model: 'gen4_turbo',
        promptText: scene.visualPrompt,
        duration: 10,
        ratio: '1280:720',
      }
      if (userPhotoBase64 && userPhotoMediaType) {
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
      console.log('Runway response:', JSON.stringify(runwayData).slice(0, 200))
      if (runwayData.id) videoTaskIds.push(runwayData.id)
    }
    return res.status(200).json({ audioBase64: null, videoTaskIds, success: true })
  } catch (error: any) {
    console.error('Error:', error.message)
    return res.status(500).json({ error: error.message })
  }
}
