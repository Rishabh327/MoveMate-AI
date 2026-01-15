
import { GoogleGenAI, Type } from "@google/genai";
import { DetectedItem } from "../types";

export const analyzeFrame = async (base64Image: string): Promise<DetectedItem[]> => {
  // Always initialize the client with the API key from environment variables directly as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: {
      parts: [
        {
          text: "Analyze this image and list all distinct household objects visible that would need to be packed for moving. For each item, provide a name, a category (e.g., Electronics, Furniture, Decor, Kitchenware), and its fragility level (Low, Medium, or High)."
        },
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Image
          }
        }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            category: { type: Type.STRING },
            fragility: { 
              type: Type.STRING,
              description: "One of: Low, Medium, High"
            }
          },
          required: ["name", "category", "fragility"]
        }
      }
    }
  });

  try {
    // Correctly accessing the text property from the response object
    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr) as DetectedItem[];
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    return [];
  }
};
