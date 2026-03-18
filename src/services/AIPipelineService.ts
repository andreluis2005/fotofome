import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { CreditService } from './CreditService';
import { MockProvider } from './ai/providers/mockProvider';
import { ReplicateProvider } from './ai/providers/replicateProvider';

interface GenerateParams {
  userId: string;
  foodDescription: string;
}

interface EnhanceParams {
  userId: string;
  imageBuffer: Buffer;
}

export class AIPipelineService {
  
  private static async getProvider() {
    if (process.env.REPLICATE_API_TOKEN) {
      return new ReplicateProvider();
    }
    return new MockProvider();
  }

  private static async executeWithFallback(method: 'generate' | 'enhance', prompt: string, imageBuffer?: Buffer): Promise<{ output: string | Uint8Array; providerName: string }> {
    let provider = await this.getProvider();
    try {
      let output: string | Uint8Array;
      if (method === 'generate') {
         output = await provider.generateImage(prompt);
      } else {
         output = await provider.enhanceImage(new Uint8Array(imageBuffer!), prompt);
      }
      console.log(`[AIPipeline] Provider '${provider.providerName}' succeeded for method '${method}'.`);
      return { output, providerName: provider.providerName };
    } catch (e: unknown) {
      console.error(`[AIPipeline] Provider ${provider.providerName} failed:`, e);
      if (provider.providerName === 'replicate') {
        console.log(`[AIPipeline] Falling back to MockProvider`);
        provider = new MockProvider();
        let output: string | Uint8Array;
        if (method === 'generate') {
           output = await provider.generateImage(prompt);
        } else {
           output = await provider.enhanceImage(new Uint8Array(imageBuffer!), prompt);
        }
        console.log(`[AIPipeline] Fallback provider '${provider.providerName}' succeeded.`);
        return { output, providerName: provider.providerName };
      }
      throw e;
    }
  }

  private static async processProviderOutput(output: string | Uint8Array): Promise<Buffer> {
    if (typeof output === 'string') {
      const fetchedResp = await fetch(output);
      const arrayBuffer = await fetchedResp.arrayBuffer();
      return Buffer.from(new Uint8Array(arrayBuffer));
    } else {
      return Buffer.from(output);
    }
  }

  /**
   * Helper que lê dinamicamente um arquivo do diretório base `/prompts`.
   */
  private static loadPromptTemplate(filename: string): string {
    const promptPath = path.join(process.cwd(), 'prompts', filename);
    if (!fs.existsSync(promptPath)) {
      throw new Error(`Prompt template not found at: ${promptPath}`);
    }
    return fs.readFileSync(promptPath, 'utf-8');
  }

  /**
   * Helper para processar o Módulo 5 (Watermarking Skill).
   * Injerta passivamente "Imagem ilustrativa" no canto inferior direito.
   */
  private static async applyWatermark(imageBuffer: Buffer): Promise<Buffer> {
    const metadata = await sharp(imageBuffer).metadata();
    const width = metadata.width || 800;
    const height = metadata.height || 800;

    // SVG String Text Overlay Configuration
    const svgOverlay = `
      <svg width="${width}" height="${height}">
        <style>
          .title { fill: rgba(255, 255, 255, 0.45); font-size: ${Math.round(width * 0.03)}px; font-family: sans-serif; font-weight: bold; }
        </style>
        <text x="98%" y="98%" text-anchor="end" class="title">Imagem ilustrativa</text>
      </svg>
    `;

    return await sharp(imageBuffer)
      .composite([{
        input: Buffer.from(svgOverlay),
        gravity: 'southeast',
      }])
      .toBuffer();
  }

  /**
   * Pipeline 1: Gera Imagem Comercial por Texto (Text-to-Image)
   */
  static async generateFoodImage(params: GenerateParams): Promise<{ success: boolean; data?: Buffer; error?: string; provider?: string }> {
    try {
      console.log(`[AIPipeline] Initiating image generation for User: ${params.userId}`);
      
      // 1. Load e Render Prompt
      const template = this.loadPromptTemplate('food-generate.prompt.md');
      const finalPrompt = template.replace('{FOOD_DESCRIPTION}', params.foodDescription);
      console.log(`[AIPipeline] Prompt Renderizado: ${finalPrompt}`);

      // 2. Integração com Provedores
      const { output, providerName } = await this.executeWithFallback('generate', finalPrompt);
      let resultBuffer = await this.processProviderOutput(output);

      // 3. Aplicar Watermark obrigatória (Compliance do Consumer Law BR)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      resultBuffer = await this.applyWatermark(resultBuffer) as any;

      // 4. Créditos — só cobra se o provider real foi usado (não mock)
      if (providerName !== 'mock-ai-provider') {
        await CreditService.consumeCredits(params.userId, 1);
        console.log(`[AIPipeline] Credits charged. Provider: ${providerName}`);
      } else {
        console.log(`[AIPipeline] MockProvider used — credits NOT charged.`);
      }

      return { success: true, data: resultBuffer, provider: providerName };
    } catch (error: unknown) {
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  /**
   * Pipeline 2: Aprimora Foto Amadora Caseira (Image-to-Image)
   */
  static async enhanceFoodImage(params: EnhanceParams): Promise<{ success: boolean; data?: Buffer; error?: string; provider?: string }> {
    try {
      console.log(`[AIPipeline] Initiating image enhancement for User: ${params.userId}`);
      
      // 1. Load Prompt (ControlNet Guidance)
      const guidancePrompt = this.loadPromptTemplate('food-enhance.prompt.md');
      console.log(`[AIPipeline] Enhancement Base Guidance: ${guidancePrompt.substring(0, 30)}...`);

      // 2. Integração com Provedores
      const { output, providerName } = await this.executeWithFallback('enhance', guidancePrompt, params.imageBuffer);
      let enhancedBuffer = await this.processProviderOutput(output);

      // 3. Aplicar Watermark (Sempre final stage)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      enhancedBuffer = await this.applyWatermark(enhancedBuffer) as any;

      // 4. Créditos — só cobra se o provider real foi usado (não mock)
      if (providerName !== 'mock-ai-provider') {
        await CreditService.consumeCredits(params.userId, 1);
        console.log(`[AIPipeline] Credits charged. Provider: ${providerName}`);
      } else {
        console.log(`[AIPipeline] MockProvider used — credits NOT charged.`);
      }

      return { success: true, data: enhancedBuffer, provider: providerName };
    } catch (error: unknown) {
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }
}
