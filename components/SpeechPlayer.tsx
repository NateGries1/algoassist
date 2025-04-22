"use client";
import { useState } from "react";
export const handleSpeak = async (text: string) => {
    try {
      const response = await fetch("https://api.lemonfox.ai/v1/audio/speech", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_LEMONFOX_API_KEY}`,
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
      await audio.play();
    } catch (error) {
      console.error("Error generating or playing speech:", error);
    }
  };
  