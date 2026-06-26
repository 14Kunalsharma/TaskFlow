const { GoogleGenerativeAI } = require('@google/generative-ai');

const MOCK_REASON = 'Fallback estimate based on task complexity heuristics.';

function getMockEstimate(title = '', description = '') {
  const text = `${title} ${description}`.trim();
  const length = text.length;

  let effort = 'M (4-8 hours)';
  if (length < 30) effort = 'S (1-3 hours)';
  else if (length > 120) effort = 'L (1-2 days)';

  const dueDate = new Date();
  if (effort.startsWith('S')) dueDate.setDate(dueDate.getDate() + 2);
  else if (effort.startsWith('M')) dueDate.setDate(dueDate.getDate() + 5);
  else dueDate.setDate(dueDate.getDate() + 10);

  return {
    effort,
    suggestedDueDate: dueDate.toISOString().split('T')[0],
    reasoning: MOCK_REASON,
    source: 'mock',
  };
}

function parseAiResponse(text) {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;

  const parsed = JSON.parse(jsonMatch[0]);
  if (!parsed.effort || !parsed.suggestedDueDate) return null;

  return {
    effort: String(parsed.effort),
    suggestedDueDate: String(parsed.suggestedDueDate),
    reasoning: parsed.reasoning || 'AI-generated estimate based on task details.',
    source: 'ai',
  };
}

async function callGemini(title, description) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your-gemini-key') {
    return getMockEstimate(title, description);
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = `You are a project management assistant. Given a task, suggest an effort estimate and due date.

Task title: ${title}
Task description: ${description || 'No description provided'}

Respond with ONLY valid JSON in this exact format:
{
  "effort": "S/M/L with hours (e.g. 'M (4-8 hours)')",
  "suggestedDueDate": "YYYY-MM-DD",
  "reasoning": "One short sentence explaining the estimate"
}`;

  const timeoutMs = 5000;
  const result = await Promise.race([
    model.generateContent(prompt),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('AI request timed out')), timeoutMs)
    ),
  ]);

  const text = result.response.text();
  const parsed = parseAiResponse(text);
  if (!parsed) {
    throw new Error('Failed to parse AI response');
  }

  return parsed;
}

async function suggestEstimate(title, description) {
  try {
    return await callGemini(title, description);
  } catch (err) {
    console.warn('AI estimate fallback:', err.message);
    return getMockEstimate(title, description);
  }
}

module.exports = { suggestEstimate, getMockEstimate };
