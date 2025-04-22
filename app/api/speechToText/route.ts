import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { Readable } from "stream";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("file");

    if (!audioFile || !(audioFile instanceof File)) {
      return NextResponse.json({ error: "Audio file is required" }, { status: 400 });
    }

    // Convert Blob/File to Buffer
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Convert Buffer to Readable stream
    const stream = Readable.from(buffer);

    const transcription = await openai.audio.transcriptions.create({
      file: stream as any, // Type workaround
      model: "gpt-4o-transcribe",
      language: "en",
    });

    return NextResponse.json(transcription);
  } catch (error) {
    console.error("Error processing audio:", error);
    return NextResponse.json({ error: "Failed to process audio" }, { status: 500 });
  }
}
