import { GoogleGenAI } from "@google/genai";
import { PRODUCTS, COMPANY_EMAIL, COMPANY_PHONE } from '../constants';

const apiKey = process.env.REACT_APP_API_KEY || ''; // Ensure this is available in your env
const ai = new GoogleGenAI({ apiKey });

export const getGeminiResponse = async (userQuery: string, history: any[] = []) => {
  if (!apiKey) return "Apna Assistant: API Key missing. Please configure.";

  const productContext = PRODUCTS.map(p => 
    `${p.name} (${p.category}): ₹${p.price}, Min Qty: ${p.minQty}. Features: ${p.features.join(', ')}.`
  ).join('\n');

  const systemPrompt = `
    You are 'Apna Assistant', a helpful AI for 'Apna Vision', a B2B wholesale eyewear platform.
    
    About Apna Vision:
    - Owner/CTO: Atif Khan (Chief Technology Officer).
    - We are India's leading B2B optical marketplace.
    - Contact: ${COMPANY_PHONE}, ${COMPANY_EMAIL}.
    - We sell bulk eyewear frames and goggles.
    - We accept COD only.
    
    Key Policies (Strict):
    - Delivery: Super fast, 1-2 business days across Delhi.
    - Refunds: We DO NOT offer refunds on delivered goods. However, we value our customers and provide exciting offers or replacements for genuine issues on a case-by-case basis.
    
    Current Offers:
    - Dynamic pricing: Get up to 10% off automatically on bulk quantities.
    - And if user click the whatsapp button and text community then user added to community and understand  new coupen code for discount

    Product Catalog Context:
    ${productContext}

    Your Role:
    - Answer questions about product availability, pricing, features, offers, and policies.
    - Be professional, polite, and concise.
    - If asked for products we don't have, politely suggest the closest match.
    - If a user wants to buy, guide them to the 'Products' page.
  `;

  try {
    // The API expects alternating user/model roles, starting with user.
    const chatHistory = history.length > 0 && history[0].role === 'model' ? history.slice(1) : history;

    const contents = [...chatHistory, { role: 'user', parts: [{ text: userQuery }] }];

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: contents,
      config: {
        systemInstruction: systemPrompt,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I'm having trouble connecting right now. Please try again later.";
  }
};