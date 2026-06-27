async function callOpenAI({ question, context }) {
  const apiKey = process.env.OPENAI_API_KEY || process.env.CODEX_API_KEY;
  if (!apiKey) return null;
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      input: [
        { role: "system", content: "You are an expert web analytics analyst. Give concise, prioritized recommendations grounded in the supplied metrics." },
        { role: "user", content: `Question: ${question}\n\nAnalytics context:\n${JSON.stringify(context, null, 2)}` }
      ]
    })
  });
  if (!response.ok) throw new Error(`OpenAI API returned ${response.status}: ${await response.text()}`);
  const data = await response.json();
  const text = data.output_text || data.output?.flatMap((item) => item.content || []).map((part) => part.text).filter(Boolean).join("\n") || "No text returned.";
  return { provider: "OpenAI/Codex-compatible", text };
}

async function callAnthropic({ question, context }) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-latest",
      max_tokens: 900,
      system: "You are an expert web analytics analyst. Give concise, prioritized recommendations grounded in the supplied metrics.",
      messages: [{ role: "user", content: `Question: ${question}\n\nAnalytics context:\n${JSON.stringify(context, null, 2)}` }]
    })
  });
  if (!response.ok) throw new Error(`Anthropic API returned ${response.status}: ${await response.text()}`);
  const data = await response.json();
  return { provider: "Anthropic", text: data.content?.map((part) => part.text).filter(Boolean).join("\n") || "No text returned." };
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const payload = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const question = String(payload.question || "").trim();
    if (!question) return res.status(400).json({ error: "Question is required." });
    const context = payload.context || {};
    const answer = (await callOpenAI({ question, context })) || (await callAnthropic({ question, context }));
    if (!answer) {
      return res.status(200).json({
        provider: "Demo analyst",
        text: "Connect OPENAI_API_KEY, CODEX_API_KEY, or ANTHROPIC_API_KEY in Vercel to enable live AI analysis. For now: prioritize Core Web Vitals on high-traffic pages, fix organic CTR gaps, and investigate crawl issues from CSV imports."
      });
    }
    return res.status(200).json(answer);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
