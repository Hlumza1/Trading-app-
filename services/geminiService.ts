
import { GoogleGenAI, Type } from "@google/genai";
import { AssetSymbol, AssetSignal, BatchSignalResponse, GroundingSource } from "../types.ts";
import { SYSTEM_INSTRUCTION, ASSETS } from "../constants.ts";

export const fetchAllMarketSignals = async (): Promise<AssetSignal[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const today = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const symbols = ASSETS.map(a => a.symbol).join(", ");
  const prompt = `Today is ${today}. Perform an immediate monthly market analysis for: ${symbols}. Use real-time web grounding to find the absolute latest prices and sentiment. Do not use cached or historical data from previous months.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
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

    const jsonResponse: BatchSignalResponse = JSON.parse(response.text || '{"signals": []}');
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
    
  } catch (error) {
    console.error(`Batch Intelligence Error:`, error);
    throw error;
  }
};
