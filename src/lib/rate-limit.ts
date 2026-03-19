import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

/**
 * Retorna o cliente Upstash RateLimit correspondente à camada solicitada.
 * Retorna null silenciosamente se as variáveis de ambiente não estiverem configuradas (ex: dev local sem Upstash).
 */
export function getRateLimit(type: 'ip' | 'user') {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  
  // Redis.fromEnv() automatically uses UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
  const redis = Redis.fromEnv();
  
  if (type === 'ip') {
    // Camada 1: Proteção Global via IP no Middleware
    // 5 requisições por minuto
    return new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '1 m'),
      ephemeralCache: new Map(),
    });
  }
  
  // Camada 2: Proteção Específica (Usuário Autenticado) nas APIs
  // 3 requisições por minuto para impedir drain de créditos
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, '1 m'),
    ephemeralCache: new Map(),
  });
}

/**
 * Helper para Structured Logging de eventos de Segurança e Abuso.
 * Recomendado para integração com Datadog, Axiom ou Sentry.
 * Evita inundação de logs verbosos em produção via console convencional.
 */
export function logSecurityEvent(event: string, details: Record<string, any>) {
  const payload = {
    timestamp: new Date().toISOString(),
    level: 'warn',
    event,
    ...details
  };

  if (process.env.NODE_ENV === 'production') {
    // Aqui seria ideal despachar para um serviço centralizado
    // Example: fetch('https://in.axiom.co/api/v1/datasets/security/ingest', {...})
    // Para cumprir o requisito de 'NÃO usar console.warn/log direto para texto plano':
    process.stdout.write(JSON.stringify(payload) + '\n');
  } else {
    // Dev experience visual
    console.log(`[SECURITY] ${event} |`, details);
  }
}
