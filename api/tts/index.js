// Sarvam AI Text-to-Speech API proxy
// POST /api/tts { text, language }
// Returns { audioBase64, language, model }

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const SARVAM_KEY = process.env.SARVAM_API_KEY;
  if (!SARVAM_KEY) {
    return res.status(503).json({ error: 'Sarvam API key not configured', code: 'NO_KEY' });
  }

  try {
    const { text, language = 'hi' } = req.body;
    if (!text) return res.status(400).json({ error: 'text is required' });

    // Map our language codes to Sarvam language codes
    const langMap = { en: 'en-IN', hi: 'hi-IN', kn: 'kn-IN' };
    const targetLang = langMap[language] || 'hi-IN';

    // Speaker voices by language
    const speakerMap = { 'en-IN': 'meera', 'hi-IN': 'meera', 'kn-IN': 'meera' };

    const sarvamRes = await fetch('https://api.sarvam.ai/text-to-speech', {
      method: 'POST',
      headers: {
        'api-subscription-key': SARVAM_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text.substring(0, 2000), // Sarvam limit
        speaker: speakerMap[targetLang],
        target_language_code: targetLang,
        model: 'bulbul:v3',
        speech_sample_rate: 22050,
      }),
    });

    if (!sarvamRes.ok) {
      const errText = await sarvamRes.text();
      console.error('[tts] Sarvam error:', sarvamRes.status, errText);
      return res.status(502).json({ error: 'Sarvam TTS failed', detail: errText });
    }

    const data = await sarvamRes.json();

    return res.status(200).json({
      audioBase64: data.audio_base64 || data.audios?.[0],
      language: targetLang,
      model: 'bulbul:v3',
    });
  } catch (e) {
    console.error('[tts]', e);
    return res.status(500).json({ error: 'TTS failed', detail: e.message });
  }
}
