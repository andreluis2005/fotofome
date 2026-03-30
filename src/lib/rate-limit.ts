import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// P4/S6: Singleton cache — evita instanciar Redis+Ratelimit a cada request
let ipRateLimiter: Ratelimit | null = null;
let userRateLimiter: Ratelimit | null = null;
let initialized = false;

function initRateLimiters() {
  if (initialized) return;
  initialized = true;

  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return;
  }

  const redis = Redis.fromEnv();

  ipRateLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 m'),
    ephemeralCache: new Map(),
  });

  userRateLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, '1 m'),
    ephemeralCache: new Map(),
  });
}

/**
 * Retorna o cliente Upstash RateLimit singleton correspondente à camada solicitada.
 * Retorna null se as variáveis de ambiente não estiverem configuradas.
 */
export function getRateLimit(type: 'ip' | 'user'): Ratelimit | null {
  initRateLimiters();
  return type === 'ip' ? ipRateLimiter : userRateLimiter;
}

/**
 * Helper para Structured Logging de eventos de Segurança e Abuso.
 */
export function logSecurityEvent(event: string, details: Record<string, unknown>) {
  const payload = {
    timestamp: new Date().toISOString(),
    level: 'warn',
    event,
    ...details
  };

  if (process.env.NODE_ENV === 'production') {
    process.stdout.write(JSON.stringify(payload) + '\n');
  } else {
    console.log(`[SECURITY] ${event} |`, details);
  }
}
