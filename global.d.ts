// global.d.ts

declare global {
    interface Window {
      SpeechRecognition: SpeechRecognitionConstructor;
      webkitSpeechRecognition: SpeechRecognitionConstructor;
    }
  
    interface SpeechRecognitionEvent extends Event {
      results: SpeechRecognitionResultList;
    }
  
    interface SpeechRecognitionErrorEvent extends Event {
      error: string;
    }
  }
  
  // Ensure the file is treated as a module
  export {};
  