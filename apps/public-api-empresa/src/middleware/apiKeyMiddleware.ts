import { Request, Response, NextFunction } from 'express';
import { prisma } from '@voz-ativa/database';
import crypto from 'crypto'

declare global {
  namespace Express {
    interface Request {
      empresaId?: string;
      apiKey?: string;
    }
  }
}

/**
 * Middleware para autenticar requisições usando API Key
 * Espera o header x-api-key
 */
export async function apiKeyMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const apiKey = req.headers['x-api-key'] as string;

    if (!apiKey) {
      return res.status(401).json({
        detail: 'API Key não fornecida. Inclua o header x-api-key.'
      });
    }

    const chaveHash = crypto
      .createHash('sha256')
      .update(apiKey)
      .digest('hex');

    const empresaChaveApi = await prisma.empresaChaveApi.findFirst({
      where: {
        chave_hash: chaveHash,
        data_revogacao: null
      },
      include: {
        empresa: true
      }
    });

    if (!empresaChaveApi) {
      return res.status(401).json({
        detail: 'API Key inválida'
      });
    }

    if (!empresaChaveApi.empresa.status) {
      return res.status(403).json({
        detail: 'Empresa inativa. Contate o suporte.'
      });
    }

    req.empresaId = empresaChaveApi.empresa_id;
    req.apiKey = apiKey;

    next();
  } catch (error) {
    console.error('Erro na autenticação por API Key:', error);
    return res.status(500).json({
      detail: 'Erro interno ao processar autenticação'
    });
  }
}
