export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { videoId } = req.query;

  if (!videoId) {
    return res.status(400).json({
      error: "videoId required",
    });
  }

  try {
    // METHOD 1 — youtubei.js
    try {
      const { Innertube } = await import("youtubei.js");

      const yt = await Innertube.create({
        retrieve_player: false,
      });

      const info = await yt.getInfo(videoId);

      const transcriptData = await info.getTranscript();

      const segments =
        transcriptData?.transcript?.content?.body?.initial_segments ??
        transcriptData?.content?.body?.initial_segments ??
        transcriptData?.body?.initial_segments ??
        [];

      const text = segments
        .map((s) => s?.snippet?.text ?? s?.text ?? "")
        .filter(Boolean)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();

      if (text) {
        return res.status(200).json({
          transcript: text,
          source: "youtubei.js",
        });
      }
    } catch (e) {
      console.log("youtubei.js failed");
    }

    // METHOD 2 — youtube-transcript fallback
    try {
      const { YoutubeTranscript } =
        await import("youtube-transcript");

      const transcript =
        await YoutubeTranscript.fetchTranscript(videoId);

      const text = transcript
        .map((t) => t.text)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();

      if (text) {
        return res.status(200).json({
          transcript: text,
          source: "youtube-transcript",
        });
      }
    } catch (e) {
      console.log("youtube-transcript failed");
    }

    return res.status(500).json({
      error:
        "Transcript unavailable. Video may not have captions enabled.",
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
}