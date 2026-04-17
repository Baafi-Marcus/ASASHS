import { db } from './neon';

export interface GeneratedQuestion {
  question_text: string;
  question_type: 'mcq' | 'tf' | 'fill_in';
  points: number;
  options?: { option_text: string; is_correct: boolean }[];
  correct_answers?: string[];
  order_index: number;
}

export const aiService = {
  async generateQuestions(text: string, count: number = 5): Promise<GeneratedQuestion[]> {
    const apiKey = await db.getSchoolSetting('github_model_api_key');
    if (!apiKey) {
      throw new Error('AI API Key not configured in Admin Settings.');
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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to generate questions');
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      // Some models might wrap the JSON in a field or just return the array
      let questions = JSON.parse(content);
      if (questions.questions) questions = questions.questions; // handle { questions: [...] }
      if (!Array.isArray(questions)) questions = [questions];

      return questions;
    } catch (error) {
      console.error('AI Generation Error:', error);
      throw error;
    }
  }
};
