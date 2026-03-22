import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function cleanGarmentImage(base64Image: string, category: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Image.split(',')[1],
            mimeType: 'image/jpeg',
          },
        },
        {
          text: `Isolate the ${category} item from this image. REMOVE the person, model, or mannequin entirely. The garment should be the ONLY thing remaining. Place the garment on a SOLID PURE WHITE background. Do not include any shadows, props, or other elements. Just the garment on white. The output should be a clean, professional product shot of just the item.`,
        },
      ],
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }

  return base64Image;
}

export async function analyzeClothingItem(base64Image: string): Promise<{
  category: string;
  color: string;
  style: string;
  tags: string[];
  brand?: string;
  material?: string;
}> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          { text: "Analyze this clothing item. Identify its category (tops, bottoms, dresses, outerwear, shoes, or accessories), primary color, style (e.g., minimalist, bohemian, streetwear, formal), brand (if visible), material (if identifiable), and 3-5 relevant tags. Return the result in JSON format." },
          { inlineData: { mimeType: "image/jpeg", data: base64Image.split(',')[1] } }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING, description: "One of: tops, bottoms, dresses, outerwear, shoes, accessories" },
          color: { type: Type.STRING },
          style: { type: Type.STRING },
          brand: { type: Type.STRING },
          material: { type: Type.STRING },
          tags: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["category", "color", "style", "tags"]
      }
    }
  });
  
  try {
    const text = response.text;
    if (!text) throw new Error("Empty response");
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse Gemini response:", e);
    return {
      category: "tops",
      color: "unknown",
      style: "casual",
      tags: []
    };
  }
}
