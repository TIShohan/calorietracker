import Groq from 'groq-sdk';
import { NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are a Bangladeshi Meal & Grocery Suggestion AI. 
User will provide a budget in Taka (BDT) and possibly a calorie goal.
Rules:
1. Suggest 2-3 meal options AND a grocery shopping list.
2. For groceries, be specific with Price and Calories: e.g., "Chicken 500g (Approx. 180 BDT, 600 kcal)".
3. Keep individual item suggestions short and concise. Use bullet points.
4. Focus on budget-friendly Bangladeshi foods.
5. Answer in a helpful, short manner. No long intros.`;

export async function POST(request) {
  try {
    const { message, budget, remainingKcal } = await request.json();

    const fullPrompt = `Budget: ${budget} Taka. Remaining Calorie Goal: ${remainingKcal} kcal. 
User Message: ${message || "Suggest some meals."}`;

    const runGroq = async (apiKey, tag) => {
      if (!apiKey) throw new Error("Key missing");
      const client = new Groq({ apiKey });
      const response = await client.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: fullPrompt }
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
