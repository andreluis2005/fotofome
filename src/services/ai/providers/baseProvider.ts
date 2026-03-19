export interface IAIProvider {
  /**
   * Nome do provedor utilizado no histórico, ex: "replicate", "openai"
   */
  providerName: string;

  /**
   * Recebe um Image URL (Signed URL) ou Buffer amador + Prompt de Enhancement.
   */
  enhanceImage(imageSource: string | Uint8Array, prompt: string): Promise<string | Uint8Array>;

  /**
   * Gera imagem abstrata por Texto.
   */
  generateImage(prompt: string): Promise<string | Uint8Array>;

  /**
   * Analisa imagem (Multimodal) para gerar texto de cardápio.
   */
  generateMenu?(imageUrl: string, prompt: string): Promise<string>;

  /**
   * Fallback de texto para cardápio.
   */
  generateMenuFallback?(textPrompt: string): Promise<string>;
}
