
import { GoogleGenAI, Modality } from "@google/genai";

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}
const ai = new GoogleGenAI({ apiKey: API_KEY });

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = (error) => reject(error);
  });
};

export const identifyLandmark = async (file: File): Promise<string> => {
  const base64Data = await fileToBase64(file);
  const imagePart = {
    inlineData: {
      data: base64Data,
      mimeType: file.type,
    },
  };
  const textPart = {
    text: "What is the name of the landmark in this image? If it is not a famous landmark, say 'not a landmark'. Provide only the name.",
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [imagePart, textPart] },
  });

  return response.text.trim();
};

export const fetchLandmarkInfo = async (landmarkName: string): Promise<{ text: string; groundingChunks: any[] }> => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Tell me a comprehensive history and interesting facts about ${landmarkName}. Make it engaging, like a tour guide.`,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  return { text: response.text, groundingChunks };
};

export const generateSpeech = async (textToNarrate: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: textToNarrate }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) {
    throw new Error("Audio generation failed, no audio data received.");
  }
  return base64Audio;
};
