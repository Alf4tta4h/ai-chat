import { GoogleGenerativeAI } from "@google/generative-ai";

interface GeminiConfig {
  apiKey: string;
  model: string;
}

export class GeminiApi {
  private genAI: GoogleGenerativeAI;
  private model: string;

  constructor(config: GeminiConfig) {
    this.genAI = new GoogleGenerativeAI(config.apiKey);
    this.model = config.model;
  }

  async generateContent(prompt: string): Promise<string> {
    const model = this.genAI.getGenerativeModel({ model: this.model });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }

  async *generateContentStream(prompt: string): AsyncGenerator<string, void, unknown> {
    const model = this.genAI.getGenerativeModel({ model: this.model });
    const result = await model.generateContentStream(prompt);
    for await (const chunk of result.stream) {
      yield chunk.text();
    }
  }
}
