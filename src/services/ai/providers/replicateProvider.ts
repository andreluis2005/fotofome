import Replicate from "replicate";
import { IAIProvider } from "./baseProvider";

export class ReplicateProvider implements IAIProvider {
  providerName = "replicate";
  private replicate: Replicate;

  constructor() {
    this.replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async processOutput(output: any): Promise<string | Uint8Array> {
    const result = Array.isArray(output) ? output[0] : output;
    
    if (!result) {
        throw new Error("No output returned from Replicate");
    }

    // Handle readable stream
    if (typeof result.getReader === 'function') {
      const chunks = [];
      const reader = result.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) chunks.push(value);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const totalLength = chunks.reduce((acc: number, val: any) => acc + val.length, 0);
      const res = new Uint8Array(totalLength);
      let offset = 0;
      for (const chunk of chunks) {
        res.set(chunk, offset);
        offset += chunk.length;
      }
      return res;
    }

    // Handle string/URL object
    return result.toString();
  }

  async enhanceImage(imageUrl: string, prompt: string): Promise<string | Uint8Array> {
    console.log(`[ReplicateProvider] Enhancing image from URL: ${imageUrl.substring(0, 50)}...`);
    
    try {
      const output = await this.replicate.run(
        "lucataco/sdxl-controlnet",
        {
          input: {
            image: imageUrl,
            prompt: prompt,
            negative_prompt: "fake food, extra ingredients, distorted, unrealistic, cartoon, oversaturated, blurry",
            condition_scale: 0.95,
            num_inference_steps: 30,
          }
        }
      );

      if (!output) {
        throw new Error("Replicate returned empty output for enhanceImage");
      }

      return this.processOutput(output);
    } catch (error: any) {
      console.error(`[AI_ENHANCE_ERROR] Model: lucataco/sdxl-controlnet | Input URL: ${imageUrl} | Error:`, error);
      throw error;
    }
  }

  async generateImage(prompt: string): Promise<string | Uint8Array> {
    console.log(`[ReplicateProvider] Generating image`);
    
    const output = await this.replicate.run(
      "black-forest-labs/flux-schnell",
      {
        input: { prompt }
      }
    );
    
    return this.processOutput(output);
  }

  async generateMenu(imageUrl: string, prompt: string): Promise<string> {
    console.log(`[ReplicateProvider] Analyzing image for menu: ${imageUrl.substring(0, 50)}...`);
    
    const output = await this.replicate.run(
      "yorickvp/llava-13b:b5f6223d9f794b1bc0058e745f9226500bd444f6f79be27063f22588c2273641",
      {
        input: {
          image: imageUrl,
          prompt: prompt,
          max_tokens: 500,
        }
      }
    );
    
    return String(output);
  }

  async generateMenuFallback(textPrompt: string): Promise<string> {
    console.log(`[ReplicateProvider] Running text fallback for menu`);
    
    const output = await this.replicate.run(
      "meta/meta-llama-3-70b-instruct",
      {
        input: {
          prompt: textPrompt,
          max_new_tokens: 500,
        }
      }
    );
    
    // llama-3-70b-instruct returns array of strings usually in this SDK
    return Array.isArray(output) ? output.join('') : String(output);
  }
}
