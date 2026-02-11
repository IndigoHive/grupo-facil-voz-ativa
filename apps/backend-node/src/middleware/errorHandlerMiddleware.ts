import { Request, Response, NextFunction } from 'express';

export function errorHandlerMiddleware(err: any, req: Request, res: Response, next: NextFunction) {
  if (err.status && err.message) {
    res.status(err.status).json({ error: err.message });
  } else {
    console.log('Erro não tratado:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}
