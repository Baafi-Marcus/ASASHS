import { db } from './neon';

export interface GeneratedQuestion {
  question_text: string;
  question_type: 'mcq' | 'tf' | 'fill_in';
  points: number;
  options?: { option_text: string; is_correct: boolean }[];
  correct_answers?: string[];
  order_index: number;
}

export class AICapacityExhaustedError extends Error {
  constructor() {
    super('AI assistance is temporarily at capacity across all active accounts.');
    this.name = 'AICapacityExhaustedError';
  }
}

export const aiService = {
  async generateQuestions(text: string, count: number = 5): Promise<GeneratedQuestion[]> {
    const apiKeys = await db.getAIKeys();
    
    if (apiKeys.length === 0) {
      throw new Error('AI service is not configured. Please add an API key in Admin Profile.');
    }

    const prompt = `
      You are an expert educator. Your task is to generate ${count} quiz questions based ONLY on the provided document text below.
      
      CRITICAL RULES:
      1. Every question MUST be directly related to the content in the text.
      2. Do NOT use general knowledge or information not found in the text.
      3. Ensure the questions test various levels of understanding.
      
      Types allowed: 
      - 'mcq' (Multiple Choice - 4 options, 1 correct)
      - 'tf' (True/False - 2 options, 1 correct)
      - 'fill_in' (Fill in the blanks - provide a list of correct string variations)

      Output ONLY a JSON array in this format:
      [
        {
          "question_text": "...",
          "question_type": "mcq",
          "points": 1,
          "options": [{"option_text": "...", "is_correct": true}, ...],
          "order_index": 0
        },
        ...
      ]
      
      TEXT FROM DOCUMENT:
      ${text.substring(0, 5000)}
    `;

    // Try each key in sequence
    for (let i = 0; i < apiKeys.length; i++) {
      const apiKey = apiKeys[i];
      try {
        const response = await fetch('https://models.inference.ai.azure.com/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            messages: [
              { role: 'system', content: 'You are a helpful assistant that generates educational quiz questions in JSON format.' },
              { role: 'user', content: prompt }
            ],
            model: 'gpt-4o',
            temperature: 0.7,
            max_tokens: 2000,
            response_format: { type: 'json_object' }
          })
        });

        if (response.status === 429 || response.status === 401 || response.status === 403) {
          console.warn(`AI Key ${i + 1} failed with status ${response.status}. Rotating...`);
          continue; // Try next key
        }

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || 'Failed to generate questions');
        }

        const data = await response.json();
        const content = data.choices[0].message.content;
        
        let questions = JSON.parse(content);
        if (questions.questions) questions = questions.questions;
        if (!Array.isArray(questions)) questions = [questions];

        return questions;
      } catch (error: any) {
        console.error(`AI Key ${i + 1} Error:`, error.message);
        if (i === apiKeys.length - 1) {
          // If this was the last key, throw a combined error
          throw error;
        }
        // Otherwise, try next key
      }
    }

    throw new AICapacityExhaustedError();
  }
};
