import { GoogleGenAI } from "@google/genai";
import { PRODUCTS, COMPANY_EMAIL, COMPANY_PHONE } from '../constants';

// Helper to safely get API key (handles browser/server env differences)
const getApiKey = (): string => {
  // Try standard process.env (Node) and REACT_APP_ prefix (Create React App)
  // Google keys often get revoked if pushed to GitHub, so we check multiple sources.
  return process.env.API_KEY || process.env.REACT_APP_API_KEY || '';
};

const apiKey = getApiKey();
const ai = new GoogleGenAI({ apiKey });

export const getGeminiResponse = async (userQuery: string, history: any[] = []) => {
  // Check if key is missing or empty
  if (!apiKey) {
    console.error("API Key is missing. Ensure REACT_APP_API_KEY is in your .env file.");
    return "Apna Assistant: API Key missing. Please check your .env configuration.";
  }

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
    - We accept UPI and COD.
    
    Key Policies (Strict):
    - Delivery: Super fast, 1-2 business days across Delhi.
    - Refunds: We DO NOT offer refunds on delivered goods. However, we value our customers and provide exciting offers or replacements for genuine issues on a case-by-case basis.
    
    Current Offers:
    - Dynamic pricing: Get up to 10% off automatically on bulk quantities.
    - a coupen code by 10 % discount descreses you can click whatsapp button and text community after you add the commnity then the coupen you will have

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
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    // Check for specific error indicating key revocation or permission issues
    const errorMessage = error.message || error.toString();
    if (errorMessage.includes('403') || errorMessage.includes('API key') || errorMessage.includes('PERMISSION_DENIED')) {
      return "Apna Assistant: My connection is blocked. The API Key is likely invalid or revoked by Google (Github push detected). Please generate a new key and update .env with REACT_APP_API_KEY.";
    }
    
    return "I'm having trouble connecting right now. Please check your internet connection and try again.";
  }
};