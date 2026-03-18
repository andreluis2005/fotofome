export interface IAIProvider {
  /**
   * Nome do provedor utilizado no histórico, ex: "replicate", "openai"
   */
  providerName: string;

  /**
   * Recebe um Image Buffer (Uint8Array) amador + Prompt de Enhancement.
   * Retorna um buffer ou URL gerado.
   */
  enhanceImage(imageBuffer: Uint8Array, prompt: string): Promise<string | Uint8Array>;

  /**
   * Recebe uma String detalhada e gera uma imagem totalmente abstrata em alta resolução.
   * Retorna um buffer ou URL.
   */
  generateImage(prompt: string): Promise<string | Uint8Array>;
}
