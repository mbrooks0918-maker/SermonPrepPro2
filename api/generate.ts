import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { title, scripture, theme } = req.body;

  const prompt = `You are a helpful sermon preparation assistant for a pastor. Based on the following sermon details, generate practical prep content to help the pastor and their team on Tuesday.

Sermon Title: ${title || 'Not yet set'}
Scripture Passage: ${scripture || 'Not yet set'}
Theme: ${theme || 'Not yet set'}

Please provide:

1. **Sermon Summary** (2-3 sentences capturing the heart of the message)

2. **3 Key Points** (clear, memorable sermon points drawn from the passage)

3. **Illustration Idea** (a relatable story, analogy, or real-life example that connects the theme to everyday life)

4. **Bottom Line Suggestion** (one punchy sentence that captures the main takeaway — something the congregation can remember and apply)

5. **Discussion Questions** (2-3 questions for small group or life group follow-up)

Keep the tone practical, warm, and ministry-focused. Avoid overly academic language.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();
    const text = data?.content?.[0]?.text || '';
    res.status(200).json({ result: text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate content' });
  }
}
