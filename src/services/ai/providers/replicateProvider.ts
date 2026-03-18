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

  async enhanceImage(imageBuffer: Uint8Array, prompt: string): Promise<string | Uint8Array> {
    console.log(`[ReplicateProvider] Enhancing image`);
    
    const mimeType = "image/jpeg";
    const base64Str = Buffer.from(imageBuffer).toString('base64');
    const dataUri = `data:${mimeType};base64,${base64Str}`;

    const output = await this.replicate.run(
      "bytedance/sdxl-lightning-4step:5f24084160c9089501c1c1a967fb4734ea071db1eb4b87aeed7a9afda2fb8096",
      {
        input: {
          image: dataUri,
          prompt: prompt,
          num_outputs: 1,
        }
      }
    );

    return this.processOutput(output);
  }

  async generateImage(prompt: string): Promise<string | Uint8Array> {
    console.log(`[ReplicateProvider] Generating image`);
    
    const output = await this.replicate.run(
      "black-forest-labs/flux-schnell",
      {
        input: {
          prompt: prompt,
          num_outputs: 1,
          output_format: "png",
        }
      }
    );
    
    return this.processOutput(output);
  }
}
