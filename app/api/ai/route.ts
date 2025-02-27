import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

export async function POST(req: NextRequest) {
  const { code, problemName, language, chat, history } = await req.json();

  console.log('code', code);
  if (!code) {
    console.log('No code provided');
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

    console.log('History:');

    for (const message of history) {
      console.log(message);
    }

    const prompt = chat
      ? chat
      : 'Give me a hint to ' + problemName + '. This is my code using ' + language + '.\n' + code;
    const result = await chatSession.sendMessage(prompt);
    const response = await result.response;
    const text = response.text();

    /*const newHistory = [
      ...history,
      {
        role: 'user',
        parts: [{ text: prompt }]
      },
      {
        role: 'model',
        parts: [{ text: text }]
      }
    ];*/

    console.log('New History:');

    for (const message of history) {
      console.log(message);
    }

    return NextResponse.json(
      {
        text: text,
        newHistory: history
      },
      {
        status: 200
      }
    );
  } catch (error) {
    console.error(error);
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
