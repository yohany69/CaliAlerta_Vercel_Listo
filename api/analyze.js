const SYSTEM_PROMPT = `Eres un experto en infraestructura urbana de Cali, Colombia. Tu trabajo es analizar fotos de problemas de infraestructura y determinar exactamente qué es y a qué entidad de Cali hay que llamar.

ANALIZA LA IMAGEN y clasifícala en uno de estos tipos:
- arbol → árbol caído, rama caída, árbol inclinado, poda urgente → DAGMA: 602 524 0580
- incendio → fuego, humo, llamas → Bomberos Cali: 119
- electrico → poste dañado, transformador, cableado eléctrico roto → EMCALI Energía: 602 524 0177
- cable → cable caído al piso, cable tirando chispa, cable de luz suelto → EMCALI Energía: 602 524 0177
- semaforo → semáforo dañado, apagado, mal → Secretaría de Movilidad Cali: 602 444 2000
- via → hueco en carretera, vía dañada, bache, pavimento roto → Secretaría de Infraestructura: 602 883 7474
- inundacion → calle inundada, agua acumulada, desbordamiento → Bomberos Cali: 119
- puente → puente dañado, grietas en puente, puente en riesgo → Secretaría de Infraestructura: 602 883 7474
- acueducto → fuga de agua potable, tubería rota, alcantarilla rota → EMCALI Acueducto: 602 524 0177
- gas → olor a gas, fuga de gas, tubería de gas → Gases de Occidente: 164
- construccion → construcción ilegal peligrosa, andamio mal puesto → Planeación Municipal: 602 620 0000
- choque → accidente de tránsito, carros chocados → Policía de Tránsito: 127
- basura → acumulación enorme de basura, escombros ilegales → EMSIRVA: 602 880 5050
- otro → cualquier otro problema urbano → Emergencias: 123

Responde ÚNICAMENTE con este JSON, sin texto adicional, sin backticks, sin markdown:
{"tipo":"[el tipo exacto de la lista]","emoji":"[emoji que represente el problema]","nombre":"[nombre corto del problema]","descripcion":"[descripción de 1-2 oraciones de lo que ves en la imagen específicamente]","urgencia":"ALTA|MEDIA|BAJA","riesgoVida":true|false,"accionInmediata":"[qué debe hacer el ciudadano AHORA MISMO en 1 oración concreta]","entidad":"[nombre completo de la entidad]","telefono":"[número de teléfono]","pasos":["paso 1 concreto","paso 2 concreto","paso 3 concreto"],"evitar":["cosa concreta a no hacer 1","cosa concreta a no hacer 2"]}`;

function cleanJSON(text) {
  const cleaned = String(text || '').replace(/```json|```/g, '').trim();
  const first = cleaned.indexOf('{');
  const last = cleaned.lastIndexOf('}');
  if (first >= 0 && last >= 0) return cleaned.slice(first, last + 1);
  return cleaned;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido. Usa POST.' });
  try {
    const { image, mime } = req.body || {};
    if (!process.env.ANTHROPIC_API_KEY) return res.status(500).json({ error: 'Falta configurar ANTHROPIC_API_KEY en Vercel.' });
    if (!image || !mime) return res.status(400).json({ error: 'Falta la imagen o el tipo MIME.' });
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || 'claude-opus-4-5',
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: [
          { type: 'image', source: { type: 'base64', media_type: mime, data: image } },
          { type: 'text', text: 'Analiza esta imagen de un problema de infraestructura en Cali, Colombia. Responde SOLO con el JSON.' }
        ]}]
      })
    });
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data?.error?.message || 'Error al consultar la API de Anthropic.' });
    const raw = data?.content?.[0]?.text;
    const parsed = JSON.parse(cleanJSON(raw));
    return res.status(200).json(parsed);
  } catch (error) {
    return res.status(500).json({ error: 'Error interno al analizar la imagen: ' + error.message });
  }
}

