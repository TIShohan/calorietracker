import Groq from 'groq-sdk';
import { NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are "NutriMind AI Coach" – a professional health, diet, and home fitness trainer.
Your goal is to provide short, actionable advice to help the user stay fit and healthy.

Rules:
1. Persona: High-energy, practical, friendly health coach.
2. Expertise: Expert in nutrition (Bangladesh context) AND home fitness.
3. Food Suggestions: Always suggest food quantities in GRAMS (e.g., "150g cooked rice", "100g chicken breast").
4. Pricing: Include approximate prices in BDT and estimated calories for all food suggestions.
5. Fitness: Suggest simple at-home exercises when relevant.
6. Be EXTREMELY concise. Use bullet points for lists. Answer short.
7. Local context: Expert on Bangladeshi food culture and bazaar prices.`;

export async function POST(request) {
  try {
    const { message, history = [], goal } = await request.json();

    // Map frontend history to Groq format: { role: 'user' | 'assistant', content: string }
    const groqHistory = history.map(m => ({
      role: m.role === 'ai' ? 'assistant' : 'user',
      content: m.text
    }));

    const runGroq = async (apiKey, tag) => {
      if (!apiKey) throw new Error("Key missing");
      const client = new Groq({ apiKey });
      
      const userContext = goal 
        ? `[Context: User's daily limit is ${goal} kcal] ${message}` 
        : message;

      const response = await client.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...groqHistory,
          { role: 'user', content: userContext || "Hello! Introduce yourself." }
        ],
        temperature: 0.7,
        max_tokens: 512,
      });
      return { text: response.choices[0].message.content, provider: tag };
    };

    try {
      if (!process.env.GROQ_API_KEY) throw new Error("Primary Key missing");
      return NextResponse.json(await runGroq(process.env.GROQ_API_KEY, '⚡ Groq (Node 1)'));
    } catch (e1) {
      console.warn('Groq Node 1 failed for suggestion...', e1.message);
      try {
        if (!process.env.GROQ_API_KEY_2) throw new Error("Backup Key missing");
        return NextResponse.json(await runGroq(process.env.GROQ_API_KEY_2, '🔥 Groq (Backup Node)'));
      } catch (e2) {
        throw new Error("Both Groq keys failed.");
      }
    }

  } catch (error) {
    console.error('Suggestion API Error:', error.message);
    return NextResponse.json(
      { error: 'AI is temporarily unavailable. Please try again later.' },
      { status: 500 }
    );
  }
}
