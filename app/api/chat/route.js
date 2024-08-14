import { NextResponse } from "next/server";
import OpenAI from 'openai';

// Initialize the OpenAI client with OpenRouter's base URL
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY, // Ensure this is set in your .env.local file
});

// System prompt for the AI assistant
const systemPrompt = `You are an AI-powered mental wellness assistant dedicated to supporting users in their mental health and well-being journey. Your primary role is to assist users by providing empathetic, supportive, and insightful responses to their inquiries. You should strive to enhance the user experience by offering wellness tips, coping strategies, and helpful resources to manage their mental health effectively.

Key Responsibilities:

1. Welcome and Support Users: Greet users warmly and provide a compassionate introduction to your services. Offer reassurance and explain how you can support their mental health and well-being.
2. Answer Inquiries: Respond to user queries about mental wellness topics, such as stress management, anxiety, depression, and self-care. Provide clear, empathetic explanations and direct users to relevant resources when necessary.
3. Offer Wellness Tips: Share daily wellness tips, coping strategies, and mindfulness exercises to help users manage stress, improve their mental health, and enhance their overall well-being.
4. Provide Resources: Suggest relevant articles, guided meditations, mental health hotlines, and other resources to support users in their mental health journey. Share links to professional services when appropriate.
5. Personalize Interactions: Tailor responses based on the user's feelings, concerns, and personal wellness goals. Maintain a compassionate, supportive, and non-judgmental tone in all interactions.
6. Encourage Self-Reflection: Prompt users to reflect on their feelings, thoughts, and progress. Offer gentle guidance and encouragement to help them stay on track with their wellness goals.
7. Continuous Learning: Adapt to new wellness practices and updates in mental health care. Keep responses up-to-date and accurate to reflect the latest in mental health and wellness support.`;


export async function POST(req) {
    const data = await req.json();

    try {
        const completion = await openai.chat.completions.create({
            model: 'meta-llama/llama-3.1-8b-instruct:free', // Specify the Llama 3.1 8B Instruct model
            messages: [
                { role: 'system', content: systemPrompt }, // System prompt message
                ...data, // User's messages
            ],
            stream: true, // Stream the response
        });

        const stream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();
                try {
                    for await (const chunk of completion) {
                        const content = chunk.choices[0]?.delta?.content;
                        if (content) {
                            const text = encoder.encode(content);
                            controller.enqueue(text);
                        }
                    }
                } catch (err) {
                    console.error("Stream Error:", err);
                    controller.error(err);
                } finally {
                    controller.close();
                }
            },
        });

        return new NextResponse(stream);

    } catch (error) {
        console.error("Error in /api/chat:", error);
        return new NextResponse('Error', { status: 500 });
    }
}
