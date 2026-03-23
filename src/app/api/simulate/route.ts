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
      // Dummy response if key is missing
      return NextResponse.json({
        data: {
          story: `(Add your OpenAI API Key to .env.local!)\n\nFast forward ${yearsInFuture} years to the year ${futureYear}. At age ${futureAge}, living in ${city} feels very different. Because of ${scenario.toLowerCase()}, under the '${trajectory}' trajectory, things have changed significantly.`,
          metrics: [
            { name: "Average Summer Temp", value: "105°F", context: "Up 12°F from today", trend: "bad" },
            { name: "Unhealthy AQI Days", value: "85 days/yr", context: "Triple the historical average", trend: "bad" },
            { name: "Sea Level Rise", value: "+1.5 ft", context: "Constant nuisance flooding", trend: "bad" }
          ]
        },
        futureYear 
      });
    }

    const prompt = `
You are a climate forecasting AI simulating the tangible future impact of environmental changes.
The user is currently ${currentAge} years old, living in ${city}.
They want to know what the numbers and daily life will look like ${yearsInFuture} years from now in the year ${futureYear}, when they are ${futureAge} years old.
They are focusing on the specific scenario: "${scenario}".

The world is currently on the following trajectory: "${trajectory}". 
(Note: 'Cleaner Future' means aggressive climate action was taken. 'Current Path' means +1.5 to 2°C warming. 'Extreme Reality' means +2.5°C+ warming).

You MUST respond in strict JSON format. Do not use markdown blocks outside of the JSON. 
Structure your JSON exactly like this:
{
  "story": "A short, engaging 2-3 sentence story in the second person ('You') about a tangible moment in their daily life highlighting the physical changes.",
  "metrics": [
    {
      "name": "Name of Metric (e.g. Summer Highs, Unhealthy AQI Days)",
      "value": "Predicted numerical value with unit",
      "context": "Short comparison to today (e.g., '+10 units from today')",
      "trend": "bad" // must be either "bad", "good", or "neutral"
    },
    ... generate exactly 3 highly relevant metrics based on their city and chosen scenario ...
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
