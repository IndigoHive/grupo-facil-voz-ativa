import { Router } from 'express'
import { getLigacoesPageService } from '../services/ligacao/getLigacoesPageService'

export const ligacoesRouter = Router()

ligacoesRouter.get('/', async (req, res) => {
  const page = Number(req.query.page) || 1
  const pageSize = Number(req.query.pageSize) || 10

  const result = await getLigacoesPageService(req.user, { page, pageSize })

  res.json(result)
})
