import React, { createContext, useContext, useEffect, useState } from 'react';

// The AI Assistant instructions the pastor can customize. {{title}},
// {{scripture}} and {{theme}} are filled in from the sermon before sending.
// This default mirrors the prompt the app has been using.
export const DEFAULT_AI_INSTRUCTIONS = `You are a sermon preparation assistant for LifePoint Church. The lead pastor teaches in the style of Andy Stanley. The goal of every message is to identify a real tension the biblical text addresses and hopefully resolves — because tension is what makes people lean in. Implications are raw material: data, facts, cultural observations, historical context, or insights related to the text that might help illuminate the tension or resolution. Think of implications as things thrown against the wall to see what sticks.

Here are the sermon details:

Sermon Title: {{title}}
Scripture Passage: {{scripture}}
Theme: {{theme}}

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

export interface AppSettings {
  aiInstructions: string;
  accentColor: string;      // hex, '' means use the app default
  notesFontFamily: string;  // CSS font-family value for the notes page
  notesFontSize: number;    // pt
  defaultCommunicator: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  aiInstructions: DEFAULT_AI_INSTRUCTIONS,
  accentColor: '',
  notesFontFamily: "Georgia, 'Times New Roman', serif",
  notesFontSize: 12,
  defaultCommunicator: '',
};

const STORAGE_KEY = 'sermonprep_settings';

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (partial: Partial<AppSettings>) => void;
  resetAIInstructions: () => void;
  resetAll: () => void;
}

const SettingsContext = createContext<SettingsContextType>({} as SettingsContextType);

export const useSettings = () => useContext(SettingsContext);

// Convert a #rrggbb hex color to an "H S% L%" string for CSS variables.
const hexToHslString = (hex: string): string | null => {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return null;
  const r = parseInt(m[1], 16) / 255;
  const g = parseInt(m[2], 16) / 255;
  const b = parseInt(m[3], 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch (e) { /* ignore */ }
    return DEFAULT_SETTINGS;
  });

  // Persist whenever settings change.
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(settings)); } catch (e) { /* ignore */ }
  }, [settings]);

  // Apply the accent color to the theme's primary CSS variables.
  useEffect(() => {
    const root = document.documentElement;
    const hsl = settings.accentColor ? hexToHslString(settings.accentColor) : null;
    if (hsl) {
      root.style.setProperty('--primary', hsl);
      root.style.setProperty('--ring', hsl);
    } else {
      root.style.removeProperty('--primary');
      root.style.removeProperty('--ring');
    }
  }, [settings.accentColor]);

  const updateSettings = (partial: Partial<AppSettings>) =>
    setSettings(prev => ({ ...prev, ...partial }));

  const resetAIInstructions = () =>
    setSettings(prev => ({ ...prev, aiInstructions: DEFAULT_AI_INSTRUCTIONS }));

  const resetAll = () => setSettings(DEFAULT_SETTINGS);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetAIInstructions, resetAll }}>
      {children}
    </SettingsContext.Provider>
  );
};
