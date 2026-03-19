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
  imageBuffer?: Buffer;
  imageUrl?: string;
}

interface MenuParams {
  userId: string;
  imageUrl: string;
  foodDescription?: string;
}

export class AIPipelineService {
  
  private static async getProvider() {
    if (process.env.REPLICATE_API_TOKEN) {
      return new ReplicateProvider();
    }
    return new MockProvider();
  }

  private static async executeWithProvider(
    method: 'generate' | 'enhance' | 'menu' | 'menu-fallback', 
    prompt: string, 
    imageSource?: Buffer | string
  ): Promise<{ output: string | Uint8Array; providerName: string }> {
    const provider = await this.getProvider();
    
    const timeout = 35000; // 35s – safe within Vercel 60s serverless limit
    const execute = async () => {
      if (method === 'generate') return await provider.generateImage(prompt);
      if (method === 'enhance') return await provider.enhanceImage(imageSource as any, prompt);
      if (method === 'menu' && provider.generateMenu) return await provider.generateMenu(imageSource as string, prompt);
      if (method === 'menu-fallback' && provider.generateMenuFallback) return await provider.generateMenuFallback(prompt);
      throw new Error(`Method ${method} not supported by provider.`);
    };

    const runWithRetry = async (retries = 1): Promise<any> => {
      try {
        return await Promise.race([
          execute(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), timeout))
        ]);
      } catch (e: any) {
        if (retries > 0 && (e.message === 'TIMEOUT' || e.status === 429 || e.status === 503)) {
          console.log(`[AIPipeline] Retrying method '${method}'...`);
          return runWithRetry(retries - 1);
        }
        throw e;
      }
    };

    try {
      const output = await runWithRetry();
      console.log(`[AIPipeline] Provider '${provider.providerName}' succeeded for method '${method}'.`);
      return { output, providerName: provider.providerName };
    } catch (e: unknown) {
      console.error(`[AIPipeline] Provider ${provider.providerName} failed:`, JSON.stringify(e, Object.getOwnPropertyNames(e), 2));
      throw new Error(`A Inteligência Artificial falhou ou demorou demais. Tente novamente. (Créditos preservadores).`);
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
      const { output, providerName } = await this.executeWithProvider('generate', finalPrompt);
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
   * Custo: 2 Créditos (Garante qualidade comercial)
   */
  static async enhanceFoodImage(params: EnhanceParams): Promise<{ success: boolean; data?: Buffer; error?: string; provider?: string }> {
    try {
      console.log(`[AIPipeline] Initiating image enhancement for User: ${params.userId}`);
      
      // 1. Controlled Internal Prompt (Quality Focused)
      const controlledPrompt = "Ultra-realistic professional food photography, commercial studio lighting, high resolution, delicious appetite appeal, 8k, sharp focus.";

      // 2. Integração com Provedores (Usando URL se disponível para estabilidade)
      const source = params.imageUrl || params.imageBuffer;
      if (!source) throw new Error("Missing image source (imageUrl or imageBuffer)");

      const { output, providerName } = await this.executeWithProvider('enhance', controlledPrompt, source as any);
      let enhancedBuffer = await this.processProviderOutput(output);

      // 3. Aplicar Watermark
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      enhancedBuffer = await this.applyWatermark(enhancedBuffer) as any;

      // 4. Créditos — Custo de 2 créditos para Enhance
      if (providerName !== 'mock-ai-provider') {
        await CreditService.consumeCredits(params.userId, 2);
        console.log(`[AIPipeline] 2 credits charged. Provider: ${providerName}`);
      }

      return { success: true, data: enhancedBuffer, provider: providerName };
    } catch (error: unknown) {
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  /**
   * Pipeline 3: Geração de Cardápio (Vision/Text)
   * Custo: 1 Crédito
   */
  static async generateMenuData(params: MenuParams): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      console.log(`[AIPipeline] Generating menu for User: ${params.userId}`);

      const prompt = "Analise este prato e descreva-o para um cardápio comercial. Retorne APENAS um JSON no formato: { \"dish_name\": \"...\", \"description\": \"...\" }. Idioma: Português do Brasil.";

      let menuOutput: string;
      try {
        // Tentativa 1: Multimodal (LLaVA)
        const { output } = await this.executeWithProvider('menu', prompt, params.imageUrl);
        menuOutput = String(output);
      } catch (e) {
        console.warn("[AIPipeline] Vision model failed, attempting text fallback...", e);
        // Tentativa 2: Fallback (Text Model)
        const fallbackPrompt = `Crie um nome criativo e uma descrição irresistível para este prato: ${params.foodDescription || 'Hambúrguer Gourmet'}. Retorne JSON { "dish_name": "...", "description": "..." } em PT-BR.`;
        const { output } = await this.executeWithProvider('menu-fallback', fallbackPrompt);
        menuOutput = String(output);
      }

      // Sanitize JSON output (handle cases where model adds markdown triple backticks)
      const jsonMatch = menuOutput.match(/\{[\s\S]*\}/);
      const cleanJson = jsonMatch ? jsonMatch[0] : menuOutput;
      const data = JSON.parse(cleanJson);

      // Descontar 1 crédito se não for mock
      const provider = await this.getProvider();
      if (provider.providerName !== 'mock-ai-provider') {
        await CreditService.consumeCredits(params.userId, 1);
      }

      return { success: true, data };
    } catch (error: unknown) {
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }
}
