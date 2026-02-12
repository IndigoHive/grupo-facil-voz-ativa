import { Request, Response, NextFunction } from 'express'

export function superAdminMiddleware(req: Request, res: Response, next: NextFunction) {
  const userPermission = req.user?.isSuperAdmin

  if (!userPermission) {
    return res.status(403).json({ message: "Acesso negado" })
  }

  next()
}
