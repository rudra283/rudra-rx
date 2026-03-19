export class OpenRouterService {
  private apiKey = process.env.OPENROUTER_API_KEY || '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';

  async chat(prompt: string, model: string) {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "HTTP-Referer": window.location.origin,
          "X-Title": "GeminiX AI Studio",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "model": model,
          "messages": [
            { "role": "user", "content": prompt }
          ]
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "OpenRouter request failed");
      }

      const data = await response.json();
      return {
        text: data.choices[0].message.content
      };
    } catch (error: any) {
      console.error("OpenRouter Chat Error:", error);
      throw error;
    }
  }

  async generateImage(prompt: string, model: string) {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "HTTP-Referer": window.location.origin,
          "X-Title": "GeminiX AI Studio",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "model": model,
          "messages": [
            { "role": "user", "content": prompt }
          ],
          "response_format": { "type": "json_object" } // Some models might need this
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "OpenRouter Image Gen failed");
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      // Try to parse if it's JSON (some models return JSON with URL)
      try {
        const parsed = JSON.parse(content);
        if (parsed.url) return parsed.url;
        if (parsed.image_url) return parsed.image_url;
        if (parsed.data?.[0]?.url) return parsed.data[0].url;
      } catch (e) {
        // Not JSON, maybe it's just the URL?
        const urlMatch = content.match(/https?:\/\/[^\s)]+/);
        if (urlMatch) return urlMatch[0];
      }

      return content; // Fallback
    } catch (error: any) {
      console.error("OpenRouter Image Error:", error);
      throw error;
    }
  }
}

export const openRouter = new OpenRouterService();
