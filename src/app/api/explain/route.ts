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
      // Dummy response if key is missing
      return NextResponse.json({
        explanation: `(Add your OpenAI API Key to .env.local to get real AI explanations!)\n\nRight now in ${location}, the temperature is ${Math.round(environmentData.temperature)}°C and the air quality is ${environmentData.aqiLabel} (AQI ${environmentData.aqi}). Regarding ${concern.toLowerCase()}, things are looking okay, but it's always good to stay informed!`
      });
    }

    const prompt = `
You are a friendly, helpful assistant talking to a regular person (not a scientist).
They are in ${location} and their main concern right now is "${concern}".

Here is the current environmental data for their location:
- Temperature: ${environmentData.temperature}°C
- Condition: ${environmentData.description}
- Air Quality Index (AQI): ${environmentData.aqi} (${environmentData.aqiLabel})
- Humidity: ${environmentData.humidity}%
- Wind Speed: ${environmentData.windSpeed} m/s

Write a short (3-4 sentences), incredibly simple, and youth-friendly explanation of what this data means for them right now, specifically focusing on their concern about ${concern}. 
Use an easily understandable analogy if it helps (e.g. "it's like breathing smoke from a campfire"). 
Do not use complicated jargon or markdown. Be conversational and direct.
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
