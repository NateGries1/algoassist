import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { text } = await req.json();

        const response = await fetch(
            "https://api.lemonfox.ai/v1/audio/speech",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${process.env.LEMONFOX_API_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    input: text,
                    voice: "sarah",
                    response_format: "mp3",
                }),
            },
        );

        if (!response.ok) {
            console.error("Lemonfox error:", await response.text());
            return new NextResponse("Failed to generate speech", {
                status: 500,
            });
        }

        const audioBuffer = await response.arrayBuffer();

        return new NextResponse(audioBuffer, {
            status: 200,
            headers: {
                "Content-Type": "audio/mpeg",
                "Content-Length": audioBuffer.byteLength.toString(),
            },
        });
    } catch (error) {
        console.error("Error generating or playing speech:", error);
        return new NextResponse("Server error", { status: 500 });
    }
}
