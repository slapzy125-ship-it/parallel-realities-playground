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
      const runwayRes = await fetch('https://api.runwayml.com/v1/image_to_video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RUNWAY_KEY}`,
          'X-Runway-Version': '2024-11-06',
        },
        body: JSON.stringify({
          model: 'gen4_turbo',
          ratio: '1280:720',
          duration: 5,
          promptText: scene.visualPrompt,
        })
      })
      const runwayText = await runwayRes.text()
      console.log('Runway status:', runwayRes.status)
      console.log('Runway response:', runwayText.slice(0, 500))
      let runwayData: any = {}
      try { runwayData = JSON.parse(runwayText) } catch(e) {}
      if (runwayData.id) videoTaskIds.push(runwayData.id)
    }
    return res.status(200).json({ audioBase64: null, videoTaskIds, success: true })
  } catch (error: any) {
    console.error('Error:', error.message)
    return res.status(500).json({ error: error.message })
  }
}
