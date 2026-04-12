import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { currentAge, futureAge, city, scenario, trajectory } = body;

    if (!currentAge || !futureAge || !city || !scenario || !trajectory) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const yearsInFuture = futureAge - currentAge;
    if (yearsInFuture <= 0) {
      return NextResponse.json({ error: 'Future age must be greater than current age' }, { status: 400 });
    }

    const futureYear = new Date().getFullYear() + yearsInFuture;

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
You are a highly advanced climate forecasting AI simulating the profound future impact of environmental changes on human life.
The user is currently ${currentAge} years old, living right now in ${city}.
They are asking you to gaze into the future and tell them exactly what their daily physical life will feel like ${yearsInFuture} years from now, in the year ${futureYear}, when they turn ${futureAge} years old.
They are highly focused on this specific environmental threat: "${scenario}".

The world is currently locked onto the following trajectory: "${trajectory}". 
(Context: 'Cleaner Future' = aggressive, rapid climate action was successfully taken. 'Current Path' = typical +1.5 to +2°C warming with moderate adaptation. 'Extreme Reality' = a severe +2.5°C or higher warming scenario where inaction led to rapid tipping points).

Your response must be striking, personal, and scientifically plausible.

You MUST respond in strict JSON format without any markdown wrappers outside the JSON string.
Structure your JSON exclusively like this:
{
  "story": "A deeply vivid, 2-3 sentence story in the second person ('You') about a routine moment in their daily life that highlights the physical changes. Make it feel real and immersive, showing—not just telling—how much the city has transformed.",
  "metrics": [
    {
      "name": "Name of Metric (e.g. Summer Highs, Unhealthy AQI Days, Sea Level)",
      "value": "Predicted numerical value with unit",
      "context": "Short, striking comparison to today (e.g., 'Double the historic average', '+15 units from today')",
      "trend": "bad" // must be one of: "bad", "good", or "neutral"
    },
    ... generate EXACTLY 3 powerful, contextually accurate metrics based on their specific city (${city}) and their chosen scenario ...
  ]
}
    `.trim();

    const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You calculate future physical environmental metrics and return strict JSON.' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 300
      })
    });

    if (!aiRes.ok) {
      const errorData = await aiRes.json();
      throw new Error(errorData.error?.message || 'Failed to call OpenAI');
    }

    const aiData = await aiRes.json();
    const contentString = aiData.choices[0].message.content.trim();
    
    let parsedData;
    try {
      parsedData = JSON.parse(contentString);
    } catch (err) {
      console.error("Failed to parse AI JSON:", contentString);
      throw new Error("AI returned malformed data.");
    }

    return NextResponse.json({ 
      data: parsedData,
      futureYear 
    });

  } catch (error: any) {
    console.error('Simulate API Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate simulation' }, { status: 500 });
  }
}
