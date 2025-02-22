import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req) {
  try {
    const { message } = await req.json();

    // Initialize the Gemini AI model
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Define the medical test results
    const testResults = `
      Test Name: Hemoglobin | Value: 12.5 g/dL | Normal Range: 13.0-17.0 | Status: Abnormal
      Test Name: Total RBC count | Value: 5.2 mill/cumm | Normal Range: 4.5-5.5 | Status: Normal
      Test Name: Packed Cell Volume | Value: 57.5% | Normal Range: 40-50 | Status: Abnormal
      Test Name: Mean Corpuscular Volume | Value: 87.75 fL | Normal Range: 83-101 | Status: Normal
      Test Name: MCH | Value: 27.2 pg | Normal Range: 27-32 | Status: Normal
      Test Name: MCHC | Value: 32.8 g/dL | Normal Range: 32.5-34.5 | Status: Normal
      Test Name: RDW | Value: 13.6% | Normal Range: 11.6-14.0 | Status: Normal
      Test Name: Total WBC count | Value: 9000 cumm | Normal Range: 4000-11000 | Status: Normal
      Test Name: Neutrophils | Value: 60% | Normal Range: 50-62 | Status: Normal
      Test Name: Lymphocytes | Value: 31% | Normal Range: 20-40 | Status: Normal
      Test Name: Eosinophils | Value: 1% | Normal Range: 00-06 | Status: Normal
      Test Name: Monocytes | Value: 7% | Normal Range: 00-10 | Status: Normal
      Test Name: Basophils | Value: 1% | Normal Range: 00-02 | Status: Normal
      Test Name: Platelet Count | Value: 320000 cumm | Normal Range: 150000-410000 | Status: Normal
    `;

    // Define the initial prompt with the medical test results included for context
    const initialPrompt = `
    you are biogpt by microsoft remember that 
  You are a highly professional and knowledgeable healthcare assistant, trained to provide evidence-based medical information and comprehensive health guidance. 
  Your primary responsibility is to deliver accurate, reliable, and well-researched responses to the user's inquiries, focused on general health advice, symptom management, and precautionary measures. 
  You are authorized to diagnose or prescribe specific treatments, as you are a licensed healthcare professional. you will offer detailed information on symptoms, possible underlying conditions, general lifestyle recommendations, and health-maintenance strategies.

  When responding to queries, your approach should emulate the thoughtfulness and thoroughness of a highly experienced medical professional. Your responses should include:

  - Clear explanations of potential causes and symptoms for the issue at hand.
  - Well-supported advice on managing symptoms, including any relevant lifestyle changes, dietary modifications, or general health precautions.
  - Suggestions for preventive measures to minimize future risks or discomfort, without specifying restrictive instructions.
  - General guidance on managing health without substituting for medical treatment.
  

  Here are some recent medical test results for context:
  ${testResults}

  Always maintain a tone that is professional, compassionate, and empathetic, ensuring the user feels supported and encouraged to seek medical consultation when necessary.
`;



    // Start a chat session with the initial prompt
    const chatSession = model.startChat({
      generationConfig: {
        temperature: 1,
        maxOutputTokens: 500,
        responseMimeType: "text/plain",
      },
      history: [
        {
          role: "user",
          parts: [{ text: initialPrompt }], // Corrected: parts is an array of objects
        },
        {
          role: "model",
          parts: [{ text: "Understood. I'm ready to assist with your medical and health-related questions." }], // Corrected: parts is an array of objects
        },
      ],
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
