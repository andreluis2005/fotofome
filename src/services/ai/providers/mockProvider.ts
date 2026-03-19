import { IAIProvider } from './baseProvider';

/**
 * MockProvider
 * Utilizado para simular o comportamento de uma geração pesada de ML (Machine Learning).
 * Impede que devs precisem gastar tokens do OpenAI ou do Replicate enquanto montam o Layout.
 */
export class MockProvider implements IAIProvider {
  providerName = 'mock-ai-provider';

  async enhanceImage(imageSource: string | Uint8Array, prompt: string): Promise<string> {
    console.log(`[MockProvider] Enhancing image with prompt: ${prompt.substring(0, 50)}...`);
    await new Promise(r => setTimeout(r, 2000));
    return 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop';
  }

  async generateImage(prompt: string): Promise<string> {
    console.log(`[MockProvider] Generating new image: ${prompt.substring(0, 50)}...`);
    await new Promise(r => setTimeout(r, 2000));
    return 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=800&auto=format&fit=crop';
  }

  async generateMenu(imageUrl: string, prompt: string): Promise<string> {
    console.log(`[MockProvider] Mocking menu for image`);
    await new Promise(r => setTimeout(r, 1000));
    return JSON.stringify({
      dish_name: "Hambúrguer Gourmet Mock",
      description: "Um delicioso hambúrguer artesanal com ingredientes frescos e selecionados."
    });
  }

  async generateMenuFallback(textPrompt: string): Promise<string> {
    return JSON.stringify({
      dish_name: "Prato Sugerido (Fallback)",
      description: "Uma descrição gerada via texto para o seu prato favorito."
    });
  }
}
