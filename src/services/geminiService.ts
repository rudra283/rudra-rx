import { GoogleGenAI, Type, Modality, ThinkingLevel } from "@google/genai";
import { MODELS } from "../constants";

export class GeminiService {
  private getAI(forceSelected: boolean = false) {
    // Priority: API_KEY (from Select Key dialog) > GEMINI_API_KEY (default)
    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || '';
    return new GoogleGenAI({ apiKey });
  }

  // 1. AI Chat (Fast or Pro) with Grounding
  async chat(prompt: string, usePro: boolean = false, useThinking: boolean = false, useSearch: boolean = false) {
    const ai = this.getAI(usePro);
    const model = usePro ? MODELS.PRO : MODELS.FAST;
    const config: any = {};
    
    if (useThinking && usePro) {
      config.thinkingConfig = { thinkingLevel: ThinkingLevel.HIGH };
    }

    if (useSearch) {
      config.tools = [{ googleSearch: {} }];
    }

    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }] }],
      config
    });

    return {
      text: response.text,
      grounding: response.candidates?.[0]?.groundingMetadata?.groundingChunks
    };
  }

  // 2. Image Generation
  async generateImage(prompt: string, model: string = MODELS.IMAGE_FREE, size: '1K' | '2K' | '4K' | '512px' = '1K', aspectRatio: string = '1:1', imageBase64?: string) {
    const isPro = model === MODELS.IMAGE_PRO || model === MODELS.IMAGE_FLASH;
    const ai = this.getAI(isPro);
    const parts: any[] = [{ text: prompt }];
    
    if (imageBase64) {
      parts.unshift({
        inlineData: {
          data: imageBase64.split(',')[1] || imageBase64,
          mimeType: 'image/png'
        }
      });
    }

    const response = await ai.models.generateContent({
      model,
      contents: { parts },
      config: {
        imageConfig: {
          aspectRatio,
          imageSize: size as any
        }
      }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image generated in response.");
  }

  // 3. Video Understanding
  async analyzeVideo(videoBase64: string, mimeType: string, prompt: string) {
    const ai = this.getAI(true);
    const response = await ai.models.generateContent({
      model: MODELS.PRO,
      contents: [
        {
          parts: [
            { inlineData: { data: videoBase64.split(',')[1] || videoBase64, mimeType } },
            { text: prompt }
          ]
        }
      ]
    });
    return response.text;
  }

  // 4. Audio Transcription
  async transcribeAudio(audioBase64: string, mimeType: string) {
    const ai = this.getAI();
    const response = await ai.models.generateContent({
      model: MODELS.FLASH,
      contents: [
        {
          parts: [
            { inlineData: { data: audioBase64.split(',')[1] || audioBase64, mimeType } },
            { text: "Transcribe this audio accurately. Only return the transcription." }
          ]
        }
      ]
    });
    return response.text;
  }

  // 5. Text to Speech (TTS)
  async generateSpeech(text: string, voice: string = 'Kore') {
    const ai = this.getAI();
    const response = await ai.models.generateContent({
      model: MODELS.TTS,
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio;
  }

  // 6. Video Generation (Veo)
  async generateVideo(prompt: string, model: string = MODELS.VEO_FAST, aspectRatio: '16:9' | '9:16' = '16:9', startFrameBase64?: string, endFrameBase64?: string) {
    const ai = this.getAI(true);
    const config: any = {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio
    };

    if (endFrameBase64) {
      config.lastFrame = {
        imageBytes: endFrameBase64.split(',')[1] || endFrameBase64,
        mimeType: 'image/png'
      };
    }

    const params: any = {
      model,
      prompt,
      config
    };

    if (startFrameBase64) {
      params.image = {
        imageBytes: startFrameBase64.split(',')[1] || startFrameBase64,
        mimeType: 'image/png'
      };
    }

    let operation = await ai.models.generateVideos(params);

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("Video generation failed: No download link received.");

    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || '';
    const response = await fetch(downloadLink, {
      method: 'GET',
      headers: {
        'x-goog-api-key': apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to download video: ${response.status}`);
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  }

  // 7. Fal.ai Video Generation (Kling, Sora, etc.)
  async generateFalVideo(prompt: string, model: string, aspectRatio: '16:9' | '9:16' = '16:9', startFrame?: string, endFrame?: string, withAudio: boolean = false) {
    const response = await fetch("/api/video/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt, model, aspectRatio, startFrame, endFrame, withAudio }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to generate video via Fal.ai.");
    }

    const { videoUrl } = await response.json();
    return videoUrl;
  }

  // 8. Document Analysis (PDF)
  async analyzeDocument(pdfBase64: string, prompt: string) {
    const ai = this.getAI();
    const response = await ai.models.generateContent({
      model: MODELS.FLASH,
      contents: [
        {
          parts: [
            { inlineData: { data: pdfBase64.split(',')[1] || pdfBase64, mimeType: 'application/pdf' } },
            { text: prompt }
          ]
        }
      ]
    });
    return response.text;
  }

  // 9. Chat Session with Document
  createChatSession(pdfBase64: string) {
    const ai = this.getAI();
    const chat = ai.chats.create({
      model: MODELS.FLASH,
      config: {
        systemInstruction: "You are an Ultimate AI Document Assistant & Tutor. You have been provided with a PDF document. Answer questions strictly based on the content of this document. Provide step-by-step explanations and examples. If you don't know the answer or it's not in the document, say so. Reference sections if possible.",
      },
      history: [
        {
          role: 'user',
          parts: [
            { inlineData: { data: pdfBase64.split(',')[1] || pdfBase64, mimeType: 'application/pdf' } },
            { text: "Please analyze this document and prepare to answer questions about it." }
          ]
        },
        {
          role: 'model',
          parts: [{ text: "I have analyzed the document and I'm ready to help you understand it. What would you like to know?" }]
        }
      ]
    });
    return chat;
  }
}

export const gemini = new GeminiService();
