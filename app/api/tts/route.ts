import { NextRequest, NextResponse } from 'next/server';
import textToSpeech, { protos } from '@google-cloud/text-to-speech';

interface GoogleCredentials {
    client_email: string;
    private_key: string;
    project_id: string;
}

export async function POST(req: NextRequest) {
    try {
        const { text } = await req.json();
        const credentials: GoogleCredentials = JSON.parse(
            process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS || '{}'
        );

        const client = new textToSpeech.TextToSpeechClient({
            credentials: {
                client_email: credentials.client_email,
                private_key: credentials.private_key
            },
            projectId: credentials.project_id
        });
        const request: protos.google.cloud.texttospeech.v1.ISynthesizeSpeechRequest = {
            input: { text },
            voice: { languageCode: 'en-US', ssmlGender: 'NEUTRAL' },
            audioConfig: { audioEncoding: 'MP3' }
        };

        const [response] = await client.synthesizeSpeech(request);

        if (!response.audioContent) {
            console.error('Google TTS error: No audio content returned.');
            return new NextResponse('Failed to generate speech', { status: 500 });
        }

        const audioBuffer = Buffer.from(response.audioContent);

        return new NextResponse(audioBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'audio/mpeg',
                'Content-Length': audioBuffer.byteLength.toString()
            }
        });
    } catch (error) {
        console.error('Google TTS error:', error);
        return new NextResponse('Server error', { status: 500 });
    }
}
