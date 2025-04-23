export const handleSpeak = async (
  text: string,
  audioRef: React.MutableRefObject<HTMLAudioElement | null>,
  isMutedRef: React.MutableRefObject<boolean>
) => {
  try {
    const response = await fetch("https://api.lemonfox.ai/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_LEMONFOX_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: text,
        voice: "sarah",
        response_format: "mp3",
      }),
    });

    if (!response.ok) throw new Error("Failed to generate speech");

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);

    // Set initial mute state based on ref
    audio.muted = isMutedRef.current;

    // Store the reference for external control
    audioRef.current = audio;

    await audio.play();
  } catch (error) {
    console.error("Error generating or playing speech:", error);
  }
};
