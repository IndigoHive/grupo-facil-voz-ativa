import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  if (err.status && err.message) {
    res.status(err.status).json({ error: err.message });
  } else {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}
