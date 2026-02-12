import { Request, Response, NextFunction } from 'express'

export function validateEmpresaAtualMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!req.user.empresa) {
    return res.status(403).json({ message: "Empresa não selecionada. Por favor, selecione uma empresa para continuar." })
  }

  next()
}
