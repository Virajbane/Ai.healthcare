import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req) {
  try {
    const { message } = await req.json();
    
    // Initialize the Gemini AI model
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    // Start a chat session
    const chatSession = model.startChat({
      generationConfig: {
        temperature: 1,
        maxOutputTokens: 500,
        responseMimeType: "text/plain",
      },
      history: [],
    });

    // Send user message to Gemini AI
    const result = await chatSession.sendMessage(message);
    const responseText = result.response.text();

    return Response.json({ response: responseText });
  } catch (error) {
    console.error("Gemini API Error:", error);
    return Response.json({ error: "Failed to generate response." }, { status: 500 });
  }
}
