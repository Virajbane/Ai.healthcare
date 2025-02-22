export async function getAIResponse(userInput) {
    const apiKey = process.env.OPENAI_API_KEY; // Read from environment variables
  
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [{ role: "user", content: userInput }],
      }),
    });
  
    const data = await response.json();
    return data;
  }
  