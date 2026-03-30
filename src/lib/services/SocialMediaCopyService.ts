export type SocialNetwork = 'facebook' | 'instagram' | 'tiktok' | 'ifood';
export type SocialFormat = 'post' | 'story' | 'cover' | 'catalog';

export interface UserMarketingContext {
  city?: string | null;
  neighborhood?: string | null;
  niche?: string | null;
}

/**
 * SocialMediaCopyService
 * Fornece textos otimizados e orientados à conversão baseados em templates programáticos.
 */
export class SocialMediaCopyService {
  
  static async generateCopy(
    network: SocialNetwork, 
    format: SocialFormat, 
    context: string = 'esta delícia',
    userContext?: UserMarketingContext
  ): Promise<string> {
    
    const city = userContext?.city || '';
    const neighborhood = userContext?.neighborhood || '';
    const niche = userContext?.niche || 'Delivery';

    // Gerador de Hashtags de Localização
    const localHashtags = [
      city ? `#${niche.replace(/\s+/g, '')}${city.replace(/\s+/g, '')}` : '',
      neighborhood ? `#${niche.replace(/\s+/g, '')}${neighborhood.replace(/\s+/g, '')}` : '',
      city ? `#Delivery${city.replace(/\s+/g, '')}` : '',
      '#fotofome'
    ].filter(h => h !== '').join(' ');
    
    if (network === 'instagram') {
      if (format === 'story') {
        return `Aquela fome bateu em ${neighborhood || city || 'casa'}? 🤤\n\nNão passa vontade não! Nosso ${context} tá saindo perfeito hoje.\n\n👇 Clica no Link e pede agora!`;
      }
      return `Uma imagem vale mais que mil palavras, mas uma mordida... ah, essa muda o seu dia! 😍📸\n\nJá experimentou nosso ${context}? Qualidade de restaurante, textura perfeita e aquele sabor que só a gente tem.\n\n📍 Corre no Link da Bio e garante o seu pedido de hoje!\n\n${localHashtags}`;
    }

    if (network === 'tiktok') {
      return `POV: Você acabou de pedir o melhor ${context} de ${city || 'toda a região'} 🥵 Dica: chega rapidinho pelo nosso delivery! Link na bio 🚚💨 ${localHashtags}`;
    }

    if (network === 'facebook') {
      if (format === 'cover') {
        return `O seu ${niche} número 1 em ${city}. Qualidade e rapidez incomparáveis.`;
      }
      return `Família reuniu em ${neighborhood || city}? Merecem a melhor comida! 🍕🍔\n\nHoje é o dia perfeito para pedir o nosso famoso ${context}. Preparamos tudo com os melhores ingredientes para chegar quentinho na sua porta.\n\n👉 Acesse o nosso cardápio no aplicativo ou mande um Whats e faça o seu pedido agora mesmo!`;
    }

    if (network === 'ifood') {
       return `Foto real do produto! Nosso ${context} é preparado com ingredientes frescos e selecionados. O melhor de ${neighborhood || city}! Entregamos rapidinho.`;
    }

    // Default Fallback
    return `Peça agora o seu ${context} em ${city} e garanta a melhor experiência para matar a sua fome! Link na Bio.`;
  }
}
