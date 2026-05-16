export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { videoId } = req.query;
  if (!videoId) return res.status(400).json({ error: "videoId required" });

  try {
    const { Innertube } = await import("youtubei.js");
    const yt = await Innertube.create({ retrieve_player: false });
    const info = await yt.getInfo(videoId);
    const transcriptData = await info.getTranscript();

    // Log full structure so we can see exact shape
    const raw = JSON.stringify(transcriptData).slice(0, 2000);
    
    // Try multiple possible paths
    const segments = 
      transcriptData?.transcript?.content?.body?.initial_segments ??
      transcriptData?.content?.body?.initial_segments ??
      transcriptData?.body?.initial_segments ??
      [];

    const text = segments
      .map(s => s?.snippet?.text ?? s?.text ?? "")
      .filter(Boolean)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    if (!text) {
      // Return raw so we can debug structure
      return res.status(500).json({ error: "No transcript parsed", debug: raw });
    }

    res.status(200).json({ transcript: text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}