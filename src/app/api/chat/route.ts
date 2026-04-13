import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { messages, contextData } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Valid messages array is required' }, { status: 400 });
    }

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY is missing. Add it to .env.local for local development.' },
        { status: 500 }
      );
    }

    let systemPrompt = `You are a helpful, expert Eco-Assistant integrated into the "What's Happening Around Me?" application.
Your goal is to answer questions about climate science, environmental metrics, and local weather patterns.
Keep your answers engaging, easy to understand, and visually appealing using markdown where appropriate (like bullet points and bold text).
Limit your responses to 1-3 short paragraphs to keep them concise and readable.`;

    // Add optional context string if the user has fetched environmental data for a location
    if (contextData) {
      systemPrompt += `\n\nAdditional Context:\nThe user is currently focusing on this environmental data:\n${JSON.stringify(contextData, null, 2)}\nYou can use this current environmental context to answer their questions accurately.`;
    }

    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];

    const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: apiMessages,
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!aiRes.ok) {
      const errorData = await aiRes.json();
      throw new Error(errorData.error?.message || 'Failed to call OpenAI');
    }

    const aiData = await aiRes.json();
    const responseText = aiData.choices[0].message.content.trim();

    return NextResponse.json({ response: responseText });

  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process chat' }, { status: 500 });
  }
}
