const COPILOT_API_URL = process.env.COPILOT_API_URL || "https://models.inference.ai.azure.com/chat/completions";
const COPILOT_MODEL = process.env.COPILOT_MODEL || "Meta-Llama-3.1-8B-Instruct";

function getCopilotApiKey() {
  return process.env.COPILOT_API_KEY || process.env.GITHUB_TOKEN || "";
}

async function callCopilotAPI(messages: Array<{ role: string; content: any }>, temperature = 0.7) {
  const apiKey = getCopilotApiKey();
  if (!apiKey || apiKey.trim() === "") return null;
  const response = await fetch(COPILOT_API_URL, {
    method: "POST",
    headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: COPILOT_MODEL, messages, temperature, max_tokens: 800 })
  });
  if (!response.ok) throw new Error(`Copilot API error ${response.status}`);
  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { messages, topicName, materialCategory } = req.body;
  if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: "O parâmetro 'messages' deve ser um array." });

  const apiKey = getCopilotApiKey();
  if (!apiKey || apiKey.trim() === "") {
    const lastMsg = messages[messages.length - 1]?.text || "";
    return res.json({ role: "mentor", text: `Estamos em modo demonstração. Sobre "${lastMsg}": foque nos fundamentos conceituais primeiro!` });
  }

  try {
    const currentQuestion = messages[messages.length - 1]?.text || "Como aprender isso?";
    const systemPrompt = `Você é o Mentor Inteligente de Aprendizado Reverso e Gamificação do SkillQuest. O estudante está aprendendo sobre "${topicName || "Fundamentos"}" na trilha de "${materialCategory || "Geral"}". Seja encorajador, responda em português com clareza.`;

    const responseText = await callCopilotAPI([
      { role: "system", content: systemPrompt },
      { role: "user", content: currentQuestion }
    ], 0.7);

    return res.json({ role: "mentor", text: responseText || "Tente novamente em alguns segundos!" });

  } catch (error: any) {
    return res.json({ role: "mentor", text: "Tive um problema de conexão. Tente novamente!" });
  }
}