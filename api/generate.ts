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
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-6',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Check specifically for billing/credit errors
      const errorMessage = data?.error?.message || '';
      if (errorMessage.includes('credit balance') || errorMessage.includes('billing') || errorMessage.includes('upgrade')) {
        return res.status(402).json({ 
          error: 'Your Anthropic API credits have run out. Please visit console.anthropic.com → Plans & Billing to add credits.' 
        });
      }
      return res.status(500).json({ error: 'AI service error: ' + errorMessage });
    }

    const text = data?.content?.[0]?.text || '';
    return res.status(200).json({ result: text });

  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Unknown error connecting to AI service.' });
  }
}
