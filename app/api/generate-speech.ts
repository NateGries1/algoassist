// app/api/generate-speech/route.ts
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const input = searchParams.get("input") || "Hello world";

  const res = await fetch("https://api.lemonfox.ai/v1/audio/speech", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.LEMONFOX_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      input,
      voice: "sarah",
      response_format: "mp3",
    }),
  });

  const audioBuffer = await res.arrayBuffer();

  return new NextResponse(audioBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioBuffer.byteLength.toString(),
    },
  });
}
