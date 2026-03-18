import { createClient } from '@/lib/supabase/server';

export interface UserCredits {
  userId: string;
  balance: number;
}

/**
 * CreditService
 * Abstração para isolar todas as operações relativas aos créditos
 * disponíveis pela compra de "Packages".
 * 
 * Tabela de referência: public.profiles (campo 'credits')
 */
export class CreditService {
  /**
   * Garante que o perfil existe. Se não existir, cria com créditos iniciais.
   */
  private static async ensureProfile(supabase: ReturnType<typeof createClient>, userId: string): Promise<number> {
    console.log(`[CreditService] ensureProfile for userId: ${userId}`);

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', userId)
      .maybeSingle();

    console.log(`[CreditService] profile lookup result:`, { profile, error: error?.message });

    if (error) {
      console.error(`[CreditService] Error fetching profile: ${error.message}`);
      // Tenta criar o perfil mesmo assim
    }

    if (!profile) {
      console.log(`[CreditService] No profile found — creating one with 5 credits for userId: ${userId}`);
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({ id: userId, credits: 5 });

      if (insertError) {
        console.error(`[CreditService] Error creating profile: ${insertError.message}`);
        // Se falhou por duplicate key (trigger já criou), tenta ler novamente
        const { data: retryProfile } = await supabase
          .from('profiles')
          .select('credits')
          .eq('id', userId)
          .maybeSingle();

        return retryProfile?.credits ?? 0;
      }

      return 5;
    }

    return profile.credits ?? 0;
  }

  /**
   * Resgata o saldo de créditos atual do usuário do Supabase
   */
  static async getUserCredits(userId: string): Promise<number> {
    const supabase = createClient();
    
    console.log(`[CreditService] getUserCredits for userId: ${userId}`);

    const credits = await this.ensureProfile(supabase, userId);
    
    console.log(`[CreditService] Final credits for userId ${userId}: ${credits}`);
    return credits;
  }

  /**
   * Consome N créditos para garantir a geração da imagem IA.
   * Lança erro se o usuário não tiver fundos suficientes.
   */
  static async consumeCredits(userId: string, amount: number = 1): Promise<boolean> {
    const supabase = createClient();
    const currentCredits = await this.ensureProfile(supabase, userId);
    
    console.log(`[CreditService] consumeCredits — userId: ${userId}, current: ${currentCredits}, requested: ${amount}`);

    if (currentCredits < amount) {
      throw new Error(`Saldo de créditos insuficiente. Você possui ${currentCredits} e precisa de ${amount}.`);
    }

    console.log(`[CreditService] Consuming ${amount} credit(s) from user: ${userId}.`);
    
    const { error } = await supabase
      .from('profiles')
      .update({ credits: currentCredits - amount })
      .eq('id', userId);
    
    if (error) {
      throw new Error(`Erro ao descontar créditos: ${error.message}`);
    }
    
    return true;
  }

  /**
   * Adiciona créditos (geralmente invocado via webhooks quando compra de um pacote)
   */
  static async addCredits(userId: string, amountToAdd: number): Promise<boolean> {
    const supabase = createClient();
    const currentCredits = await this.ensureProfile(supabase, userId);
    
    console.log(`[CreditService] Adding ${amountToAdd} credit(s) to user: ${userId}. Current: ${currentCredits}`);
    
    const { error } = await supabase
      .from('profiles')
      .update({ credits: currentCredits + amountToAdd })
      .eq('id', userId);
    
    if (error) {
      throw new Error(`Erro ao adicionar créditos: ${error.message}`);
    }
    
    return true;
  }
}
