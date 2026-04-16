import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { title, scripture, theme } = req.body;

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured. Please contact your administrator.' });
  }

  const prompt = `You are a sermon preparation assistant for LifePoint Church. The lead pastor teaches in the style of Andy Stanley using the ME/WE/GOD/YOU/WE message framework. The goal of every message is to identify a real tension the biblical text addresses and hopefully resolves — because tension is what makes people lean in. Implications are raw material: data, facts, cultural observations, historical context, or insights related to the text that might help illuminate the tension or resolution. Think of implications as things thrown against the wall to see what sticks.

Here are the sermon details:

Sermon Title: ${title || 'Not yet set'}
Scripture Passage: ${scripture || 'Not yet set'}
Theme: ${theme || 'Not yet set'}

Please provide the following:

---

1. **The Tension**
What is the real, felt tension this passage addresses? State it as a conflict between two things people actually experience — something that makes them lean in. For example: "We believe God is good, but suffering feels like evidence He isn't." Be specific and honest. Avoid churchy framing.

---

2. **The Resolution**
How does this passage resolve or respond to that tension? What does the text offer that changes
