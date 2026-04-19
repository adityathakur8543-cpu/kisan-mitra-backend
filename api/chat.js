export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { message, language = "hi", history = [] } = req.body;

    if (!message) return res.status(400).json({ error: "Message required" });

    const systemPrompt = language === "hi"
      ? `आप किसान मित्र हैं — एक AI कृषि सहायक। हमेशा सरल हिंदी में जवाब दें। फसल, मिट्टी, कीट, पशुपालन और सरकारी योजनाओं पर व्यावहारिक सलाह दें।`
      : `You are Kisan Mitra — an AI agricultural assistant for Indian farmers. Reply in simple English. Give practical advice on crops, soil, pests, animal husbandry and government schemes.`;

    const messages = [
      ...history.slice(-6),
      { role: "user", content: message }
    ];

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        system: systemPrompt,
        messages
      })
    });

    const data = await response.json();
    if (!response.ok) return res.status(500).json({ error: data.error?.message || "API error" });

    return res.status(200).json({ reply: data.content[0].text });

  } catch (err) {
    return res.status(500).json({ error: "Server error: " + err.message });
  }
}
