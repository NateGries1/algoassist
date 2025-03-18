import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

export async function POST(req: NextRequest) {
  const { code, problemName, language, chat, history } = await req.json();

  if (!code) {
    return NextResponse.json(
      {
        message: 'Bad'
      },
      {
        status: 400
      }
    );
  }

  try {
    const chatSession = model.startChat({
      history: history, // Use provided history from frontend
      generationConfig: {
        maxOutputTokens: 200
      }
    });

    const prompt =
      chat +
      'The problem im trying to solve is ' +
      problemName +
      '. This is my code using ' +
      language +
      '.\n' +
      code;
    const result = await chatSession.sendMessage(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json(
      {
        text: text,
        newHistory: history,
        aiResponse: text
      },
      {
        status: 200
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        errror: error
      },
      {
        status: 500
      }
    );
  }
}