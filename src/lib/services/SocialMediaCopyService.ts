export type SocialNetwork = 'facebook' | 'instagram' | 'tiktok' | 'ifood';
export type SocialFormat = 'post' | 'story' | 'cover' | 'catalog';

/**
 * SocialMediaCopyService
 * Fornece textos otimizados e orientados à conversão baseados em templates programáticos.
 * A assinatura assíncrona foi projetada para que a migração para a API da OpenAI/ChatGPT
 * seja transparente para o front-end futuramente.
 */
export class SocialMediaCopyService {
  
  static async generateCopy(
    network: SocialNetwork, 
    format: SocialFormat, 
    context: string = 'esta delícia'
  ): Promise<string> {
    // 🚧 FUTURE LLM INTEGRATION HOOK
    // const prompt = `Escreva uma legenda matadora de conversão para ${network} no formato ${format}...`;
    // const response = await openai.chat.completions.create({ ... });
    
    // ✅ CURRENT STRATEGY: High-conversion programmatic templates to save API costs
    
    if (network === 'instagram') {
      if (format === 'story') {
        return `Aquela fome bateu? 🤤\n\nNão passa vontade não! Nosso ${context} tá saindo perfeito hoje.\n\n👇 Clica no Link e pede agora!`;
      }
      return `Uma imagem vale mais que mil palavras, mas uma mordida... ah, essa muda o seu dia! 😍📸\n\nJá experimentou nosso ${context}? Qualidade de restaurante, textura perfeita e aquele sabor que só a gente tem.\n\n📍 Corre no Link da Bio e garante o seu pedido de hoje!\n\n#foodporn #delivery #instafood #matandoafome`;
    }

    if (network === 'tiktok') {
      return `POV: Você acabou de pedir o melhor ${context} da sua vida 🥵 Dica: chega rapidinho pelo nosso delivery! Link na bio 🚚💨 #foodtiktok #delivery`;
    }

    if (network === 'facebook') {
      if (format === 'cover') {
        return `O seu Delivery número 1. Qualidade e rapidez incomparáveis.`;
      }
      return `Família reunida merece a melhor comida! 🍕🍔\n\nHoje é o dia perfeito para pedir o nosso famoso ${context}. Preparamos tudo com os melhores ingredientes para chegar quentinho na sua porta.\n\n👉 Acesse o nosso cardápio no aplicativo ou mande um Whats e faça o seu pedido agora mesmo!`;
    }

    if (network === 'ifood') {
       return `Foto real do produto! Nosso ${context} é preparado com ingredientes frescos e selecionados, embalado com todo cuidado para manter a temperatura até a sua casa.`;
    }

    // Default Fallback
    return `Peça agora o seu ${context} e garanta a melhor experiência para matar a sua fome! Link na Bio.`;
  }
}
