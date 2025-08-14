import { Config } from '../types';

export const loadConfig = (): Config => {
  return {
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    
    database: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      name: process.env.DB_NAME || 'fintech_app',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password'
    },
    
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD
    },
    
    rabbitmq: {
      url: process.env.RABBITMQ_URL || 'amqp://localhost:5672'
    },
    
    jwt: {
      secret: process.env.JWT_SECRET || 'your_jwt_secret_key_here',
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    },
    
    paystack: {
      secretKey: process.env.PAYSTACK_SECRET_KEY || 'your_paystack_secret_key',
      publicKey: process.env.PAYSTACK_PUBLIC_KEY || 'your_paystack_public_key',
      webhookSecret: process.env.PAYSTACK_WEBHOOK_SECRET || 'your_webhook_secret'
    },
    
    security: {
      bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
      rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
      rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10)
    }
  };
};

export default loadConfig;
