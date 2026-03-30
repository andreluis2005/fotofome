import Replicate from "replicate";
import { IAIProvider } from "./baseProvider";

type ReplicateOutput = string | string[] | ReadableStream | Uint8Array | Record<string, unknown>;

interface ReadableStreamLike {
  getReader(): ReadableStreamDefaultReader<Uint8Array>;
}

export class ReplicateProvider implements IAIProvider {
  providerName = "replicate";
  private replicate: Replicate;

  constructor() {
    this.replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });
  }

  private async processOutput(output: ReplicateOutput): Promise<string | Uint8Array> {
    const result = Array.isArray(output) ? output[0] : output;
    
    if (!result) {
        throw new Error("No output returned from Replicate");
    }

    // Handle readable stream
    if (typeof result === 'object' && 'getReader' in result && typeof (result as ReadableStreamLike).getReader === 'function') {
      const stream = result as ReadableStreamLike;
      const chunks: Uint8Array[] = [];
      const reader = stream.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) chunks.push(value);
      }
      const totalLength = chunks.reduce((acc, val) => acc + val.length, 0);
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
    console.log("[ENHANCE_USING_IMG2IMG]");

    const input = {
      image: imageUrl,
      prompt: prompt,
      prompt_strength: 0.35,
      num_inference_steps: 30,
      guidance_scale: 7.5
    };

    try {
      const output = await this.replicate.run(
        "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
        { input }
      ) as ReplicateOutput;

      if (!output) {
        throw new Error("Empty output from Replicate (img2img)");
      }

      console.log("[ENHANCE_SUCCESS]");
      return this.processOutput(output);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error(`[ENHANCE_TOTAL_FAILURE] Error:`, msg);
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
    ) as ReplicateOutput;
    
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
    
    return Array.isArray(output) ? output.join('') : String(output);
  }
}
