/**
 * Lyric Studio — transcription automatique
 *
 * Reçoit un morceau audio brut (WAV 16 kHz mono, découpé côté navigateur)
 * et le transmet à l'API de transcription d'OpenAI, qui renvoie le texte
 * avec l'horodatage de chaque mot.
 *
 * Variable d'environnement requise sur Vercel : OPENAI_API_KEY
 */

export const config = {
  api: { bodyParser: false },
  maxDuration: 60
};

function readRaw(req) {
  return new Promise((resolve, reject) => {
    const parts = [];
    let size = 0;
    req.on('data', c => {
      size += c.length;
      if (size > 4_300_000) { reject(new Error('TOO_LARGE')); req.destroy(); return; }
      parts.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(parts)));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Language');
    return res.status(204).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée.' });
  }

  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return res.status(500).json({
      error: "Aucune clé n'est configurée sur le serveur. Ajoute OPENAI_API_KEY dans les réglages du projet Vercel, puis redéploie."
    });
  }

  let audio;
  try {
    audio = await readRaw(req);
  } catch (e) {
    if (e.message === 'TOO_LARGE') {
      return res.status(413).json({ error: 'Extrait trop lourd. Réduis la durée des tranches.' });
    }
    return res.status(400).json({ error: "Lecture de l'audio impossible." });
  }
  if (!audio || audio.length < 1000) {
    return res.status(400).json({ error: 'Aucun audio reçu.' });
  }

  const lang = (req.headers['x-language'] || '').toString().trim();

  const form = new FormData();
  form.append('file', new Blob([audio], { type: 'audio/wav' }), 'chunk.wav');
  form.append('model', 'whisper-1');
  form.append('response_format', 'verbose_json');
  form.append('timestamp_granularities[]', 'word');
  form.append('timestamp_granularities[]', 'segment');
  if (lang && lang !== 'auto') form.append('language', lang);

  try {
    const r = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}` },
      body: form
    });

    if (!r.ok) {
      const detail = await r.text();
      let msg = "La transcription a échoué.";
      if (r.status === 401) msg = "La clé OPENAI_API_KEY est refusée. Vérifie-la dans les réglages Vercel.";
      else if (r.status === 429) msg = "Quota dépassé ou trop de requêtes. Réessaie dans un instant.";
      return res.status(r.status).json({ error: msg, detail: detail.slice(0, 300) });
    }

    const data = await r.json();
    return res.status(200).json({
      text: data.text || '',
      language: data.language || null,
      duration: data.duration || null,
      words: (data.words || []).map(w => ({ w: w.word, s: w.start, e: w.end })),
      segments: (data.segments || []).map(s => ({ t: s.text, s: s.start, e: s.end }))
    });
  } catch (e) {
    return res.status(500).json({ error: "Le serveur de transcription est injoignable." });
  }
}
