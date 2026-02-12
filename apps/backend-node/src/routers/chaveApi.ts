import { Router } from 'express'
import { createEmpresaChaveApiService } from '../services/chave-api/createEmpresaChaveApiService'
import { listEmpresaChaveApiService } from '../services/chave-api/listEmpresaChaveApiService'
import { revokeEmpresaChaveApiService } from '../services/chave-api/revokeEmpresaChaveApiService'
import { validateEmpresaAtualMiddleware } from '../middleware/validateEmpresaAtualMiddleware'

export const chaveApiRouter = Router()

chaveApiRouter.post('/', validateEmpresaAtualMiddleware, async (req, res) => {
  const result = await createEmpresaChaveApiService(req.user, req.body)
  res.status(201).json(result)
})

chaveApiRouter.get('/', validateEmpresaAtualMiddleware, async (req, res) => {
  const result = await listEmpresaChaveApiService(req.user)
  res.status(200).json(result)
})

chaveApiRouter.post('/:id/revogar', validateEmpresaAtualMiddleware, async (req, res) => {
  await revokeEmpresaChaveApiService(req.user, req.params.id as string)
  res.status(204).send()
})
