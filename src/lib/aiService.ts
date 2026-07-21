import { db } from '../../lib/neon';

export interface ExtractedQuestion {
  question_text: string;
  question_type: 'multiple_choice' | 'true_false' | 'short_answer';
  points: number;
  order_index?: number;
  options?: { option_text: string; is_correct: boolean }[];
  correct_answers?: string[];
  group_id?: number;
  pageIndex?: number;
  imageDataUrl?: string;
  diagramDescription?: string;
}

interface AiProviderConfig {
  provider: string;
  key_value: string;
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function mapQuestionFields(q: any): ExtractedQuestion {
  return {
    question_text: q.question_text || '',
    question_type: q.question_type || 'multiple_choice',
    points: q.points ?? 1,
    order_index: q.order_index,
    options: q.options || [],
    correct_answers: q.correct_answers || [],
    group_id: q.group_id,
    pageIndex: q.page_index !== undefined ? q.page_index : q.pageIndex,
    imageDataUrl: q.imageDataUrl,
    diagramDescription: q.diagram_description || q.diagramDescription,
  };
}

export const aiService = {
  async extractQuestions(rawText: string): Promise<ExtractedQuestion[]> {
    const keys = await db.getAiApiKeys();
    const activeKeys = keys.filter((k: any) => k.is_active);
    
    if (activeKeys.length === 0) {
      throw new Error('No active AI API keys found. Please ask the Admin to configure them in System Settings.');
    }

    for (const key of activeKeys) {
      try {
        if (key.provider === 'gemini') {
          return await this.callGemini(key.key_value, rawText);
        } else if (key.provider === 'openai') {
          return await this.callOpenAI(key.key_value, rawText);
        } else if (key.provider === 'github') {
          return await this.callGithub(key.key_value, rawText);
        }
      } catch (error) {
        console.error(`AI extraction failed for provider ${key.provider}:`, error);
        await db.markApiKeyFailed(key.id);
      }
    }

    throw new Error('All configured AI API providers failed to process the request.');
  },

  async extractQuestionsFromImages(images: Blob[]): Promise<ExtractedQuestion[]> {
    const keys = await db.getAiApiKeys();
    const activeKeys = keys.filter((k: any) => k.is_active);

    if (activeKeys.length === 0) {
      throw new Error('No active AI API keys found.');
    }

    let questions: ExtractedQuestion[] = [];

    for (const key of activeKeys) {
      try {
        if (key.provider === 'gemini') {
          questions = await this.callGeminiWithImages(key.key_value, images);
        } else if (key.provider === 'openai') {
          questions = await this.callVisionAI(key.key_value, images);
        } else if (key.provider === 'github') {
          questions = await this.callGithubWithImages(key.key_value, images);
        }
        break;
      } catch (error) {
        console.error(`Vision extraction failed for provider ${key.provider}:`, error);
        await db.markApiKeyFailed(key.id);
      }
    }

    if (questions.length === 0) {
      throw new Error('All AI providers failed vision-based extraction.');
    }

    const dataUrls = await Promise.all(
      images.map(img => {
        return new Promise<string>(resolve => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(img);
        });
      })
    );

    return questions.map(q => ({
      ...q,
      imageDataUrl: q.pageIndex !== undefined && q.pageIndex >= 0 && q.pageIndex < dataUrls.length
        ? dataUrls[q.pageIndex]
        : undefined
    }));
  },

  async callGemini(apiKey: string, text: string): Promise<ExtractedQuestion[]> {
    const prompt = this.getPromptSystemInstructions();
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          role: "user",
          parts: [{ text: `${prompt}\n\nRaw Text:\n${text}` }]
        }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    if (!response.ok) throw new Error(`Gemini API Error: ${response.statusText}`);

    const data = await response.json();
    const resultText = data.candidates[0].content.parts[0].text;
    return JSON.parse(resultText);
  },

  async callGeminiWithImages(apiKey: string, images: Blob[]): Promise<ExtractedQuestion[]> {
    const prompt = this.getVisionPromptSystemInstructions();
    const parts: any[] = [{ text: prompt }];

    for (const img of images) {
      const b64 = await blobToBase64(img);
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: b64
        }
      });
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: "user", parts }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    if (!response.ok) throw new Error(`Gemini Vision API Error: ${response.statusText}`);

    const data = await response.json();
    const resultText = data.candidates[0].content.parts[0].text;
    const parsed = JSON.parse(resultText);
    const rawQuestions = parsed.questions ? parsed.questions : parsed;
    return Array.isArray(rawQuestions) ? rawQuestions.map(mapQuestionFields) : [];
  },

  async callVisionAI(apiKey: string, images: Blob[]): Promise<ExtractedQuestion[]> {
    const prompt = this.getVisionPromptSystemInstructions();
    const content: any[] = [{ type: 'text', text: prompt }];

    for (const img of images) {
      const b64 = await blobToBase64(img);
      content.push({
        type: 'image_url',
        image_url: { url: `data:image/jpeg;base64,${b64}` }
      });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [{ role: 'user', content }],
        max_tokens: 16384
      })
    });

    if (!response.ok) throw new Error(`Vision API Error: ${response.statusText}`);

    const data = await response.json();
    let resultText = data.choices[0].message.content;

    if (resultText.startsWith('```json')) {
      resultText = resultText.replace(/```json\n?/, '').replace(/```\n?$/, '');
    } else if (resultText.startsWith('```')) {
      resultText = resultText.replace(/```\n?/, '').replace(/```\n?$/, '');
    }

    const parsed = JSON.parse(resultText.trim());
    const rawQuestions = parsed.questions ? parsed.questions : parsed;
    return Array.isArray(rawQuestions) ? rawQuestions.map(mapQuestionFields) : [];
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

    if (!response.ok) throw new Error(`OpenAI API Error: ${response.statusText}`);

    const data = await response.json();
    const resultText = data.choices[0].message.content;
    const parsed = JSON.parse(resultText);
    
    if (Array.isArray(parsed)) return parsed;
    if (parsed.questions && Array.isArray(parsed.questions)) return parsed.questions;
    
    return parsed;
  },

  async callGithub(apiKey: string, text: string): Promise<ExtractedQuestion[]> {
    const prompt = this.getPromptSystemInstructions();
    const response = await fetch('https://models.inference.ai.azure.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: text }
        ]
      })
    });

    if (!response.ok) throw new Error(`GitHub Models API Error: ${response.statusText}`);

    const data = await response.json();
    let resultText = data.choices[0].message.content;
    
    if (resultText.startsWith('```json')) {
      resultText = resultText.replace(/```json\n?/, '').replace(/```\n?$/, '');
    } else if (resultText.startsWith('```')) {
      resultText = resultText.replace(/```\n?/, '').replace(/```\n?$/, '');
    }

    const parsed = JSON.parse(resultText.trim());
    
    return parsed.questions ? parsed.questions : parsed;
  },

  async callGithubWithImages(apiKey: string, images: Blob[]): Promise<ExtractedQuestion[]> {
    const prompt = this.getVisionPromptSystemInstructions();
    const content: any[] = [{ type: 'text', text: prompt }];

    for (const img of images) {
      const b64 = await blobToBase64(img);
      content.push({
        type: 'image_url',
        image_url: { url: `data:image/jpeg;base64,${b64}` }
      });
    }

    const response = await fetch('https://models.inference.ai.azure.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{ role: 'user', content }],
        max_tokens: 16384
      })
    });

    if (!response.ok) throw new Error(`GitHub Vision API Error: ${response.statusText}`);

    const data = await response.json();
    let resultText = data.choices[0].message.content;

    if (resultText.startsWith('```json')) {
      resultText = resultText.replace(/```json\n?/, '').replace(/```\n?$/, '');
    } else if (resultText.startsWith('```')) {
      resultText = resultText.replace(/```\n?/, '').replace(/```\n?$/, '');
    }

    const parsed = JSON.parse(resultText.trim());
    const rawQuestions = parsed.questions ? parsed.questions : parsed;
    return Array.isArray(rawQuestions) ? rawQuestions.map(mapQuestionFields) : [];
  },

  async analyzeCASheetTemplate(input: { text?: string; image?: Blob }): Promise<{
    ca_weight_obj: number;
    ca_weight_theory: number;
    ca_instructions: string;
    ca_columns: Array<{ id: string; name: string; weight: number; is_auto_obj: boolean }>;
  }> {
    const keys = await db.getAiApiKeys();
    const activeKeys = keys.filter((k: any) => k.is_active);

    const prompt = this.getCAWeightingPrompt();

    if (activeKeys.length === 0) {
      return {
        ca_weight_obj: 40,
        ca_weight_theory: 60,
        ca_instructions: 'Standard Continuous Assessment format: 40% Objective section, 60% Theory section.',
        ca_columns: [
          { id: 'col_obj', name: 'Auto-Graded Objective (APK)', weight: 40, is_auto_obj: true },
          { id: 'col_theory', name: 'Manual Written Theory', weight: 60, is_auto_obj: false }
        ]
      };
    }

    for (const key of activeKeys) {
      try {
        if (input.image) {
          const b64 = await blobToBase64(input.image);
          if (key.provider === 'gemini') {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key.key_value}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{
                  role: "user",
                  parts: [
                    { text: prompt },
                    { inlineData: { mimeType: input.image.type || 'application/pdf', data: b64 } }
                  ]
                }],
                generationConfig: { responseMimeType: "application/json" }
              })
            });
            if (response.ok) {
              const data = await response.json();
              return JSON.parse(data.candidates[0].content.parts[0].text);
            }
          } else if (key.provider === 'openai' || key.provider === 'github') {
            const url = key.provider === 'openai' ? 'https://api.openai.com/v1/chat/completions' : 'https://models.inference.ai.azure.com/chat/completions';
            const model = key.provider === 'openai' ? 'gpt-4o-mini' : 'gpt-4o';
            const response = await fetch(url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${key.key_value}`
              },
              body: JSON.stringify({
                model,
                response_format: { type: 'json_object' },
                messages: [{
                  role: 'user',
                  content: [
                    { type: 'text', text: prompt },
                    { type: 'image_url', image_url: { url: `data:${input.image.type || 'image/jpeg'};base64,${b64}` } }
                  ]
                }]
              })
            });
            if (response.ok) {
              const data = await response.json();
              let content = data.choices[0].message.content;
              if (content.startsWith('```json')) content = content.replace(/```json\n?/, '').replace(/```\n?$/, '');
              else if (content.startsWith('```')) content = content.replace(/```\n?/, '').replace(/```\n?$/, '');
              return JSON.parse(content.trim());
            }
          }
        } else if (input.text) {
          if (key.provider === 'gemini') {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key.key_value}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ role: "user", parts: [{ text: `${prompt}\n\nDocument/Template Text:\n${input.text}` }] }],
                generationConfig: { responseMimeType: "application/json" }
              })
            });
            if (response.ok) {
              const data = await response.json();
              return JSON.parse(data.candidates[0].content.parts[0].text);
            }
          } else {
            const url = key.provider === 'openai' ? 'https://api.openai.com/v1/chat/completions' : 'https://models.inference.ai.azure.com/chat/completions';
            const model = key.provider === 'openai' ? 'gpt-4o-mini' : 'gpt-4o';
            const response = await fetch(url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${key.key_value}`
              },
              body: JSON.stringify({
                model,
                response_format: { type: 'json_object' },
                messages: [
                  { role: 'system', content: prompt },
                  { role: 'user', content: input.text }
                ]
              })
            });
            if (response.ok) {
              const data = await response.json();
              let content = data.choices[0].message.content;
              if (content.startsWith('```json')) content = content.replace(/```json\n?/, '').replace(/```\n?$/, '');
              else if (content.startsWith('```')) content = content.replace(/```\n?/, '').replace(/```\n?$/, '');
              return JSON.parse(content.trim());
            }
          }
        }
      } catch (error) {
        console.error(`AI CA weighting analysis failed for ${key.provider}:`, error);
      }
    }

    return {
      ca_weight_obj: 40,
      ca_weight_theory: 60,
      ca_instructions: 'Standard Continuous Assessment format: 40% Objective section, 60% Theory section.',
      ca_columns: [
        { id: 'col_obj', name: 'Auto-Graded Objective (APK)', weight: 40, is_auto_obj: true },
        { id: 'col_theory', name: 'Manual Written Theory', weight: 60, is_auto_obj: false }
      ]
    };
  },

  getCAWeightingPrompt() {
    return `You are an expert curriculum and Continuous Assessment (CA) policy analyzer for schools (Ghana Education Service / ASASHS).
Analyze the provided Continuous Assessment (CA) score sheet template, table headings, grading rubrics, or text description.
Identify ALL grading columns/sections required by this sheet (e.g., Class Tests, Group Projects, Homework, Mid-Term, End-of-Term Objective, End-of-Term Theory).
For each column, determine its percentage weighting and whether it is the auto-graded digital objective test (is_auto_obj: true) or a manual teacher-entered score (is_auto_obj: false).

Also determine the overall ca_weight_obj and ca_weight_theory totals.

Output exactly a JSON object conforming to this schema:
{
  "ca_weight_obj": number (e.g. 40),
  "ca_weight_theory": number (e.g. 60),
  "ca_instructions": "string summarizing how teachers should grade and submit this exact sheet",
  "ca_columns": [
    {
      "id": "string unique id like col_test1",
      "name": "string header title like Class Test / Quiz",
      "weight": number percentage weight like 15,
      "is_auto_obj": boolean
    }
  ]
}`;
  },

  getPromptSystemInstructions() {
    return `You are an educational assistant designed to extract structured quiz/exam questions from raw text or OCR'd documents.
Read the provided raw text thoroughly. Identify all the questions, their type, the options provided, and the correct answer if indicated.
If no correct answer is indicated in the text, guess it if it's obvious, or leave it blank.

For mathematical expressions, use LaTeX notation enclosed in $$ or \( \) delimiters:
- Matrices: $$\\begin{pmatrix} 1 & 2 \\\\ 3 & 4 \\end{pmatrix}$$
- Fractions: $$\\frac{1}{2}$$
- Square roots: $$\\sqrt{3}$$
- Exponents: $$x^2$$
- Subscripts: $$x_1$$
- Summation: $$\\sum_{i=1}^n$$
- Integrals: $$\\int_a^b$$
- Sets: $$\\{ x \\mid x > 0 \\}$$
- Greek letters: $$\\alpha, \\beta, \\pi$$
- Arrows: $$\\rightarrow, \\Rightarrow$$
- Comparison: $$\\leq, \\geq, \\neq, \\approx$$

Output exactly a JSON array of objects conforming to this schema. DO NOT wrap the array in any object.
[
  {
    "question_text": "string (use LaTeX $$...$$ for math)",
    "question_type": "multiple_choice" | "true_false" | "short_answer",
    "points": number (default to 1),
    "options": [
      {
        "option_text": "string (use LaTeX for math in options too)",
        "is_correct": boolean
      }
    ],
    "correct_answers": ["string"]
  }
]

IMPORTANT:
- Read thoroughly. Do not skip any questions.
- For short_answer, correct_answers is an array of acceptable string answers.
- The output MUST be valid JSON.
- Preserve ALL mathematical notation using LaTeX.`;
  },

  getVisionPromptSystemInstructions() {
    return `You are an educational assistant analyzing exam pages from a PDF.
Look at each page image carefully. Identify ALL questions, their options, and correct answers.

For ANY mathematical notation including matrices, use LaTeX:
- Matrices: $$\\begin{pmatrix} 1 & 2 \\\\ 3 & 4 \\end{pmatrix}$$  or  $$\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}$$
- Matrices with brackets: use pmatrix or bmatrix
- System of equations: $$\\begin{cases} x + y = 5 \\\\ 2x - y = 3 \\end{cases}$$
- Fractions: $$\\frac{1}{2}$$
- Square roots: $$\\sqrt{3}$$
- Exponents: $$x^2$$
- Subscripts: $$x_1$$
- Summation: $$\\sum_{i=1}^n$$
- Integrals: $$\\int_a^b$$
- Greek letters: $$\\alpha, \\beta, \\pi, \\theta$$
- Arrows: $$\\rightarrow, \\Rightarrow, \\Leftrightarrow$$
- Comparison: $$\\leq, \\geq, \\neq, \\approx$$

IMPORTANT - For each question that references a diagram, table, chart, map, or image, populate the "diagram_description" field with a detailed description of what the diagram shows (labels, axes, values, relationships, etc.).

CRITICAL - For every question, set the "page_index" field to the 0-based index of the page image it came from (first page = 0, second page = 1, etc.).

If you see ruled lines or answer spaces, note them as "_____" in the question.

Output exactly a JSON object with a "questions" key containing an array:
{
  "questions": [
    {
      "question_text": "string (use LaTeX $$...$$ for all math)",
      "question_type": "multiple_choice" | "true_false" | "short_answer",
      "points": 1,
      "page_index": 0,
      "diagram_description": "string or null if no diagram is referenced",
      "options": [
        { "option_text": "string", "is_correct": boolean }
      ],
      "correct_answers": ["string"]
    }
  ]
}

IMPORTANT:
- DO NOT skip any questions on any page
- Preserve ALL mathematical notation precisely using LaTeX
- Every question MUST have a page_index field
- The output MUST be valid JSON`;
  }
};
