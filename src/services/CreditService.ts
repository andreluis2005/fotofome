import { createClient } from '@/lib/supabase/server';

export interface UserCredits {
  userId: string;
  balance: number;
}

/**
 * CreditService
 * Abstração para isolar todas as operações relativas aos créditos
 * disponíveis pela compra de "Packages" e checagem de Assinaturas (Tiers).
 * 
 * Tabela de referência: public.profiles (campos 'credits' e 'tier')
 */
export class CreditService {
  /**
   * Obtém o perfil de forma segura, presumindo que a trigger do DB está correta.
   * Usando .limit(1) bloqueia a quebra "Cannot coerce the result to a single JSON object" 
   * originada por dados sujos de ambiente dev antigo.
   */
  private static async getProfileSafe(supabase: ReturnType<typeof createClient>, userId: string): Promise<number> {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', userId)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error(`[CreditService] Erro consultando perfil: ${error.message}`);
      throw new Error("Erro interno ao validar créditos.");
    }

    if (!profile) {
      console.error(`[CreditService] Perfil não encontrado para userId: ${userId}. Trigger falhou em tempo de criacão?`);
      return 0; // Return zero securely without crashing
    }

    return profile.credits ?? 0;
  }

  /**
   * Resgata o saldo de créditos atual do usuário do Supabase
   */
  static async getUserCredits(userId: string): Promise<number> {
    const supabase = createClient();
    
    console.log(`[CreditService] getUserCredits for userId: ${userId}`);

    const credits = await this.getProfileSafe(supabase, userId);
    
    console.log(`[CreditService] Final credits for userId ${userId}: ${credits}`);
    return credits;
  }

  /**
   * Resgata o nível de assinatura (Tier) do usuário (free, pro, plus)
   */
  static async getUserTier(userId: string): Promise<'free' | 'pro' | 'plus'> {
    const supabase = createClient();
    
    console.log(`[CreditService] fetching Tier for userId: ${userId}`);

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('tier')
      .eq('id', userId)
      .limit(1)
      .maybeSingle();

    if (error || !profile) {
      console.error(`[CreditService] Cannot fetch tier, defaulting to free.`);
      return 'free';
    }

    return profile.tier as 'free' | 'pro' | 'plus';
  }

  /**
   * Consome N créditos para garantir a geração da imagem IA.
   * Utiliza RPC para uma atualização atômica no banco,
   * eliminando condições de corrida (Race Conditions).
   */
  static async consumeCredits(userId: string, amount: number = 1): Promise<boolean> {
    const supabase = createClient();
    
    console.log(`[CreditService] Requesting atomic deduction of ${amount} credit(s).`);

    const { data, error } = await supabase.rpc('decrement_credits', { amount });

    if (error) {
       console.error(`[CreditService] RPC Error: ${error.message}`);
       throw new Error(`Erro interno ao processar créditos. Resposta do banco falhou.`);
    }

    // A RPC retorna JSON: { success: boolean, remaining_credits: number }
    if (!data || !data.success) {
       const balance = await this.getProfileSafe(supabase, userId);
       throw new Error(`Saldo de créditos insuficiente. Você possui ${balance} e precisa de ${amount}.`);
    }

    console.log(`[CreditService] Atomic deduction successful. Remaining credits: ${data.remaining_credits}`);
    return true;
  }

  /**
   * Adiciona créditos atomicamente via RPC (invocado via webhooks de compra).
   * Usa a mesma estratégia do consumeCredits para prevenir race conditions.
   */
  static async addCredits(userId: string, amountToAdd: number): Promise<boolean> {
    const supabase = createClient();
    
    console.log(`[CreditService] Adding ${amountToAdd} credit(s) to user: ${userId} via RPC.`);

    const { data, error } = await supabase.rpc('increment_credits', { amount: amountToAdd });

    if (error) {
      console.error(`[CreditService] RPC increment_credits Error: ${error.message}`);
      throw new Error(`Erro ao adicionar créditos: ${error.message}`);
    }

    if (!data || !data.success) {
      throw new Error('Falha ao adicionar créditos. Perfil não encontrado.');
    }

    console.log(`[CreditService] Credits added. New balance: ${data.remaining_credits}`);
    return true;
  }
}
