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

  const prompt = `You are a sermon preparation assistant for LifePoint Church. The lead pastor teaches in the style of Andy Stanley. The goal of every message is to identify a real tension the biblical text addresses and hopefully resolves — because tension is what makes people lean in. Implications are raw material: data, facts, cultural observations, historical context, or insights related to the text that might help illuminate the tension or resolution. Think of implications as things thrown against the wall to see what sticks.

Here are the sermon details:

Sermon Title: ${title || 'Not yet set'}
Scripture Passage: ${scripture || 'Not yet set'}
Theme: ${theme || 'Not yet set'}

Please provide the following:

---

1. **The Tension**
What is the real, felt tension this passage addresses? State it as a conflict between two things people actually experience — something that makes them lean in. Be specific and honest. Avoid churchy framing. Write it as a sentence or two that a person in the congregation would immediately recognize as true of their own life.

---

2. **The Resolution**
How does this passage resolve or respond to that tension? What does the text offer that changes how someone sees or lives with that tension?

---

3. **Sermon Summary**
2-3 sentences capturing the heart of the message in plain, conversational language.

---

4. **Implications & Research Angles**
List 6-8 implications, data points, cultural observations, or historical/contextual facts related to the passage and theme. These are raw ideas to throw against the wall — some may end up in the message, some won't. Think statistics, cultural trends, historical background, word studies, surprising facts, or real-world examples that could make the tension feel more real or the resolution more compelling.

---

5. **5 Possible Bottom Lines**
Five options for the bottom line — one punchy, memorable sentence that captures the heart of the message. Offer variety: some declarative, some as a question, some that lean into the tension, some that land on the resolution. The congregation should be able to carry it out the door.

---

6. **Discussion Questions**
3 questions for small group or life group follow-up. Make them practical and focused on application, not just comprehension.

---

7. **Team Notes**
Brief notes for the creative and worship team including:
- 3-4 worship song suggestions that fit the tension or theme
- One creative element or illustration idea the team could develop
- Any series connection notes if this message fits into a broader arc

---

Keep the tone conversational, honest, and practical. Avoid academic or overly religious language. Write as if you are helping a pastor who wants their congregation to actually engage with and apply Scripture — not just hear a lecture.`;

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
