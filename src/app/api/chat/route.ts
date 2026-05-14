import { convertToModelMessages, streamText, UIMessage } from 'ai';
import { openai } from '@ai-sdk/openai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, contextData }: { messages: UIMessage[]; contextData?: any } =
    await req.json();

  let systemPrompt = `You are a helpful, expert Eco-Assistant integrated into the "What's Happening Around Me?" application.
Your goal is to answer questions about climate science, environmental metrics, and local weather patterns.
Keep your answers engaging, easy to understand, and visually appealing using markdown where appropriate (like bullet points and bold text).
Limit your responses to 1-3 short paragraphs to keep them concise and readable.`;

  // Add optional context string if the user has fetched environmental data for a location
  if (contextData) {
    systemPrompt += `\n\nAdditional Context:\nThe user is currently focusing on this environmental data:\n${JSON.stringify(contextData, null, 2)}\nYou can use this current environmental context to answer their questions accurately.`;
  }

  const result = streamText({
    model: openai('gpt-4o-mini'),
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    temperature: 0.7,
    maxOutputTokens: 500,
  });

  return result.toUIMessageStreamResponse();
}
