import { GoogleGenAI } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const generateProductDescription = async (
  productName: string,
  category: string,
  features: string[],
) => {
  try {
    if (!ai) return "AI feature temporarily unavailable.";
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a high-converting, professional e-commerce product description for a product named "${productName}" in the "${category}" category. Key features to highlight: ${features.join(", ")}. Keep it under 150 words.`,
      config: {
        temperature: 0.7,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Failed to generate description. Please try again.";
  }
};

export const getInventoryAdvice = async (
  stockLevel: number,
  salesTrend: string,
) => {
  try {
    if (!ai) return "AI feature temporarily unavailable.";
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Act as a retail inventory consultant. A product has ${stockLevel} items left in stock. The recent sales trend is: ${salesTrend}. Provide a one-sentence recommendation (e.g., Restock soon, Clear inventory, Steady).`,
    });
    return response.text;
  } catch (error) {
    return "No recommendation available.";
  }
};

export const generateCustomerResponse = async (
  orderId: string,
  status: string,
  issue: string,
) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Write a polite customer support response for order ${orderId} which is currently ${status}. The customer is asking about: ${issue}. Be empathetic and helpful.`,
    });
    return response.text;
  } catch (error) {
    return "We are looking into your order status and will get back to you shortly.";
  }
};
