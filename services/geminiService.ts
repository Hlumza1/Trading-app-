
import { GoogleGenAI, Type } from "@google/genai";
import { AssetSymbol, AssetSignal, BatchSignalResponse, GroundingSource } from "../types.ts";
import { SYSTEM_INSTRUCTION, ASSETS } from "../constants.ts";

export const fetchAllMarketSignals = async (): Promise<AssetSignal[]> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey === "undefined" || apiKey === "") {
    throw new Error("API_KEY_MISSING: Please set your Gemini API Key in the Vercel Environment Variables.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const today = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const symbols = ASSETS.map(a => a.symbol).join(", ");
  const prompt = `Today is ${today}. Perform a professional, institutional monthly analysis for: ${symbols}. You MUST use Google Search to verify latest prices and news on Investing.com and ForexFactory. Return the analysis in the requested JSON format.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Upgraded to Pro for complex market reasoning
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            signals: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  symbol: { type: Type.STRING },
                  signal: { type: Type.STRING },
                  lastPrice: { type: Type.STRING },
                  technicalSummary: { type: Type.STRING },
                  fundamentalSummary: { type: Type.STRING },
                  justification: { type: Type.STRING }
                },
                required: ["symbol", "signal", "technicalSummary", "fundamentalSummary"]
              }
            }
          }
        }
      },
    });

    if (!response.text) {
      throw new Error("EMPTY_RESPONSE: The model returned no data. Try again in a few moments.");
    }

    let jsonResponse: BatchSignalResponse;
    try {
      jsonResponse = JSON.parse(response.text.trim());
    } catch (parseError) {
      console.error("Parse Error:", response.text);
      throw new Error("DATA_MALFORMED: The intelligence engine returned an unreadable format. Retrying may fix this.");
    }

    const candidate = response.candidates?.[0];
    const globalSources: GroundingSource[] = [];
    if (candidate?.groundingMetadata?.groundingChunks) {
      candidate.groundingMetadata.groundingChunks.forEach((chunk: any) => {
        if (chunk.web) {
          globalSources.push({
            title: chunk.web.title || "Market Intelligence Source",
            uri: chunk.web.uri
          });
        }
      });
    }

    const timestamp = new Date().toLocaleString();

    return jsonResponse.signals.map(sig => ({
      ...sig,
      name: ASSETS.find(a => a.symbol === sig.symbol)?.name || sig.symbol,
      lastUpdated: timestamp,
      sources: globalSources.slice(0, 8)
    })) as AssetSignal[];
    
  } catch (error: any) {
    console.error(`Intelligence Refresh Error:`, error);
    
    // Extract more meaningful error messages for the user
    if (error.message?.includes("429")) {
      throw new Error("RATE_LIMIT: Too many requests. Please wait a minute before scanning again.");
    }
    if (error.message?.includes("401")) {
      throw new Error("INVALID_KEY: Your API key appears to be invalid or expired.");
    }
    
    throw error;
  }
};
