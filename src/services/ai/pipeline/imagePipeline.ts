import { IAIProvider } from '../providers/baseProvider';
import { CreditService } from '../../CreditService';

interface PipelineParams {
  userId: string;
  actionType: 'ENHANCE' | 'GENERATE';
  promptData: string;
  imageBuffer?: Uint8Array;
}

export class ImagePipeline {
  private provider: IAIProvider;

  // Injeção de Dependências.
  constructor(provider: IAIProvider) {
    this.provider = provider;
  }

  /**
   * Entrypoint para a pipeline. Segue rigorosamente o fluxo:
   * Upload (Mock recebido) -> Storage -> AI pipeline -> Watermark -> Preview
   */
  async execute(params: PipelineParams): Promise<string | Uint8Array> {
    const { userId, actionType, promptData, imageBuffer } = params;
    console.log(`[ImagePipeline] Initiating pipeline for user ${userId} | Action: ${actionType}`);

    // Etapa 0: Verificação Financeira (Consume Crédito previamente)
    await CreditService.consumeCredits(userId, 1);

    // Etapa 1 e 2: Na vida real - Subiria pra um Temporary Supabase Bucket.
    // O mock pula isso assumindo que as bytes já estão na memória.

    // Etapa 3: AI Pipeline Call (Core)
    let aiOutput: string | Uint8Array;
    if (actionType === 'ENHANCE') {
      if (!imageBuffer) throw new Error("Image buffer is required for enhancement.");
      aiOutput = await this.provider.enhanceImage(imageBuffer, promptData);
    } else {
      aiOutput = await this.provider.generateImage(promptData);
    }
    console.log(`[ImagePipeline] Processing via ${this.provider.providerName} finished successfully.`);

    // Etapa 4: Watermark
    // Exemplo de console, aqui entraríamos aplicando buffer.ts da skill watermarking.
    console.log(`[ImagePipeline] Appending watermark overlay: "Imagem ilustrativa".`);
    // const finalWatermarkedData = applyWatermark(aiOutput, "Imagem ilustrativa");

    // Etapa 5: Store Final Image - "Supabase final DB saving would happen here"
    
    // Retorna URL de preview ou Raw Buffer 
    return aiOutput;
  }
}
