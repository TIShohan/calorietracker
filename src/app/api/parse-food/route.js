import Groq from 'groq-sdk';
import { NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are a precise health analysis AI. Your ONLY job is to parse food OR exercise descriptions and return structured JSON.

Rules:
1. Respond with a JSON object containing a single key "entries" that holds an array.
2. Each element MUST have a "type" field: either "food" or "exercise".
3. For "food": include "food_item", "calories" (positive), "protein", "fat", "carbs".
4. For "exercise": include "food_item" (name of activity), "calories" (approximate burned, positive integer!), and 0 for macros.
5. If multiple items/exercises are mentioned, list them separately in the array.
6. All numeric values must be integers.

JSON schema (strictly follow this):
{
  "entries": [
    {
      "type": "food" | "exercise",
      "food_item": "string",
      "calories": integer,
      "protein": integer,
      "fat": integer,
      "carbs": integer
    }
  ]
}`;

export async function POST(request) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'No food description provided' }, { status: 400 });
    }

    const runGroq = async (apiKey, tag) => {
      if (!apiKey) throw new Error("Key missing");
      const client = new Groq({ apiKey });
      const response = await client.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content: text }],
        response_format: { type: 'json_object' },
        temperature: 0.1, max_tokens: 1024,
      });
      let parsed = JSON.parse(response.choices[0].message.content.trim());
      return { entries: parsed.entries || [], provider: tag };
    };

    try {
      // 1. Try Primary Groq Key
      if (!process.env.GROQ_API_KEY) throw new Error("Primary Key missing");
      return NextResponse.json(await runGroq(process.env.GROQ_API_KEY, '⚡ Groq (Node 1)'));
    } catch (e1) {
      console.warn('Groq Node 1 failed...', e1.message);
      
      try {
        // 2. Try Backup Groq Key
        if (!process.env.GROQ_API_KEY_2) throw new Error("Backup Key missing");
        return NextResponse.json(await runGroq(process.env.GROQ_API_KEY_2, '🔥 Groq (Backup Node)'));
      } catch (e2) {
        throw new Error("Both Groq keys failed or are missing.");
      }
    }

  } catch (error) {
    console.error('API Error:', error.message);
    return NextResponse.json(
      { error: 'All AI nodes are currently busy. Try again later.' },
      { status: 500 }
    );
  }
}


