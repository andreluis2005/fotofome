import { IAIProvider } from './baseProvider';

/**
 * MockProvider
 * Utilizado para simular o comportamento de uma geração pesada de ML (Machine Learning).
 * Impede que devs precisem gastar tokens do OpenAI ou do Replicate enquanto montam o Layout.
 */
export class MockProvider implements IAIProvider {
  providerName = 'mock-ai-provider';

  async enhanceImage(imageBuffer: Uint8Array, prompt: string): Promise<string> {
    console.log(`[MockProvider] Enhancing image with prompt: ${prompt.substring(0, 50)}...`);
    // Dá um "delay" fingindo uma request pesada de 2s
    await new Promise(r => setTimeout(r, 2000));
    
    // Retorna uma URL ilustrativa de uma imagem deliciosa placeholder simulando que deu certo.
    return 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop';
  }

  async generateImage(prompt: string): Promise<string> {
    console.log(`[MockProvider] Generating new image from text prompt: ${prompt.substring(0, 50)}...`);
    // Simulando delay processamento
    await new Promise(r => setTimeout(r, 2000));
    
    // Retorna um burger de exemplo HD do unsplash
    return 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=800&auto=format&fit=crop';
  }
}
