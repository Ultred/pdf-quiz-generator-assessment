import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { text } = await req.json();

  if (!text) {
    return NextResponse.json({ error: "No text provided." }, { status: 400 });
  }

  // Check for the API key on the server to provide a clear error
  if (!process.env.OPENAI_API_KEY) {
    console.error("OPENAI_API_KEY is not set in .env.local");
    return NextResponse.json(
      { error: "Server configuration error: API key not found." },
      { status: 500 }
    );
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that generates quizzes from text. Your response must be a valid JSON array of objects, where each object has 'question', 'options', and 'answer' keys.",
          },
          {
            role: "user",
            content: `Create a 5-question multiple choice quiz based on the following text:\n\n${text.substring(
              0,
              4000
            )}`,
          },
        ],
        temperature: 0.5,
      }),
    });

    const data = await response.json();

    // If the response from OpenAI is NOT okay, forward the actual error
    if (!response.ok) {
      console.error("OpenAI API Error:", data); // Log the full error from OpenAI
      const errorMessage =
        data.error?.message || "An unknown error occurred with the OpenAI API.";
      // Use the status code from OpenAI's response if available
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status || 500 }
      );
    }

    // Frontend will receive a meaningful error message
    return NextResponse.json({ quiz: data.choices[0].message.content });
  } catch (error) {
    console.error("Server-side fetch error:", error);
    return NextResponse.json(
      { error: "Server error: Failed to connect to OpenAI." },
      { status: 500 }
    );
  }
}
