import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const { messages, contextData } = await request.json();

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: 'OPENAI_API_KEY is missing.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let systemPrompt = `You are a helpful, expert Eco-Assistant integrated into the "What's Happening Around Me?" application.
Your goal is to answer questions about climate science, environmental metrics, and local weather patterns.
Keep your answers engaging, easy to understand, and visually appealing using markdown where appropriate (like bullet points and bold text).
Limit your responses to 1-3 short paragraphs to keep them concise and readable.`;

    // Add optional context string if the user has fetched environmental data for a location
    if (contextData) {
      systemPrompt += `\n\nAdditional Context:\nThe user is currently focusing on this environmental data:\n${JSON.stringify(contextData, null, 2)}\nYou can use this current environmental context to answer their questions accurately.`;
    }

    const result = streamText({
      model: openai('gpt-4o-mini', { apiKey: OPENAI_API_KEY }),
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      temperature: 0.7,
      maxTokens: 500,
    });

    return result.toDataStreamResponse();

  } catch (error: any) {
    console.error('Chat API Error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Failed to process chat' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
