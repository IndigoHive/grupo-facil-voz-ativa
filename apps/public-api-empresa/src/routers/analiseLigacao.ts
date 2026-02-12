import { Router } from 'express';
import { analiseLigacaoService } from '../services/analise-ligacao/analiseLigacaoService';

export const analiseLigacaoRouter = Router();

analiseLigacaoRouter.post(
  '/',
  async (req, res) => {
    const empresaId = req.empresaId!;

    const headers: Record<string, string> = {};
    Object.keys(req.headers).forEach(key => {
      const value = req.headers[key];
      if (typeof value === 'string') {
        headers[key] = value;
      } else if (Array.isArray(value)) {
        headers[key] = value[0];
      }
    });

    const resultado = await analiseLigacaoService(
      req.body,
      empresaId,
      headers
    );

    return res.status(202).json(resultado)
  }
);

