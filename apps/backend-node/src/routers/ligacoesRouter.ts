import { Router } from 'express'
import { getLigacoesPageService } from '../services/ligacao/getLigacoesPageService'
import { validateEmpresaAtualMiddleware } from '../middleware/validateEmpresaAtualMiddleware'

export const ligacoesRouter = Router()

ligacoesRouter.get('/', validateEmpresaAtualMiddleware, async (req, res) => {
  const page = Number(req.query.page) || 1
  const pageSize = Number(req.query.pageSize) || 10

  const result = await getLigacoesPageService(req.user!, { page, pageSize })

  res.json(result)
})
