import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { location, concern, environmentData } = body;

    if (!location || !concern || !environmentData) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        {
          error: 'OPENAI_API_KEY is missing. Add it to .env.local for local development or set it in your deployment environment.',
        },
        { status: 500 }
      );
    }

    const prompt = `
You are a friendly, highly empathetic, and insightful assistant talking to a regular person (someone without a science background).
They are currently in ${location} and their primary concern today is "${concern}".

Here is the real-time environmental data for their specific location:
- Temperature: ${environmentData.temperature}°C
- Weather Condition: ${environmentData.description}
- Air Quality Index (AQI): ${environmentData.aqi} (${environmentData.aqiLabel})
- Humidity: ${environmentData.humidity}%
- Wind Speed: ${environmentData.windSpeed} m/s

Your task is to write a short (3-4 sentences), highly engaging, and youth-friendly explanation of what this data actually feels like right now, specifically tying it back to their concern about ${concern}. 
- Use a vivid, easily understandable analogy to make the numbers real (e.g. "it's like breathing smoke from a campfire" or "like standing behind a hot bus exhaust"). 
- Offer one quick, practical piece of advice on how they should go about their day based on this data.
- Do not use complicated jargon or markdown. Keep the tone conversational, helpful, and direct.
    `.trim();

    const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 150
      })
    });

    if (!aiRes.ok) {
      const errorData = await aiRes.json();
      throw new Error(errorData.error?.message || 'Failed to call OpenAI');
    }

    const aiData = await aiRes.json();
    const explanation = aiData.choices[0].message.content.trim();

    return NextResponse.json({ explanation });

  } catch (error: any) {
    console.error('Explain API Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate explanation' }, { status: 500 });
  }
}
