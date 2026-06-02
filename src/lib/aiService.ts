import { db } from './neon';

export interface ExtractedQuestion {
  question_text: string;
  question_type: 'multiple_choice' | 'true_false' | 'short_answer';
  points: number;
  options?: { option_text: string; is_correct: boolean }[];
  correct_answers?: string[];
}

interface AiProviderConfig {
  provider: string;
  key_value: string;
}

export const aiService = {
  async extractQuestions(rawText: string): Promise<ExtractedQuestion[]> {
    // 1. Fetch available API keys
    const keys = await db.getAiApiKeys();
    const activeKeys = keys.filter((k: any) => k.is_active);
    
    if (activeKeys.length === 0) {
      throw new Error('No active AI API keys found. Please ask the Admin to configure them in System Settings.');
    }

    // Attempt providers in order of priority
    for (const key of activeKeys) {
      try {
        if (key.provider === 'gemini') {
          return await this.callGemini(key.key_value, rawText);
        } else if (key.provider === 'openai') {
          return await this.callOpenAI(key.key_value, rawText);
        }
      } catch (error) {
        console.error(`AI extraction failed for provider ${key.provider}:`, error);
        // Mark as failed in DB
        await db.markApiKeyFailed(key.id);
        // Continue to next key
      }
    }

    throw new Error('All configured AI API providers failed to process the request.');
  },

  async callGemini(apiKey: string, text: string): Promise<ExtractedQuestion[]> {
    const prompt = this.getPromptSystemInstructions();
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: `${prompt}\n\nRaw Text:\n${text}` }]
          }
        ],
        generationConfig: {
          responseMimeType: "application/json",
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API Error: ${response.statusText}`);
    }

    const data = await response.json();
    const resultText = data.candidates[0].content.parts[0].text;
    return JSON.parse(resultText);
  },

  async callOpenAI(apiKey: string, text: string): Promise<ExtractedQuestion[]> {
    const prompt = this.getPromptSystemInstructions();
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        response_format: { type: "json_object" },
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: text }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API Error: ${response.statusText}`);
    }

    const data = await response.json();
    const resultText = data.choices[0].message.content;
    const parsed = JSON.parse(resultText);
    
    // Handle case where OpenAI wraps the array in an object due to json_object requirement
    if (Array.isArray(parsed)) return parsed;
    if (parsed.questions && Array.isArray(parsed.questions)) return parsed.questions;
    
    return parsed;
  },

  getPromptSystemInstructions() {
    return `You are an educational assistant designed to extract structured quiz/exam questions from raw text or OCR'd documents.
Read the provided raw text thoroughly. Identify all the questions, their type, the options provided, and the correct answer if indicated.
If no correct answer is indicated in the text, guess it if it's obvious, or leave it blank.

Output exactly a JSON array of objects conforming to this schema. DO NOT wrap the array in any object.
[
  {
    "question_text": "string",
    "question_type": "multiple_choice" | "true_false" | "short_answer",
    "points": number (default to 1),
    "options": [ // ONLY for multiple_choice or true_false
      {
        "option_text": "string",
        "is_correct": boolean
      }
    ],
    "correct_answers": ["string"] // ONLY for short_answer
  }
]

IMPORTANT:
- Read thoroughly. Do not skip any questions.
- For short_answer, correct_answers is an array of acceptable string answers.
- The output MUST be valid JSON.`;
  }
};
