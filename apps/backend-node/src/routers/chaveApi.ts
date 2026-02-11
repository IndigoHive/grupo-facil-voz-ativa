import { Router } from 'express'
import { createEmpresaChaveApiService } from '../services/chave-api/createEmpresaChaveApiService'
import { listEmpresaChaveApiService } from '../services/chave-api/listEmpresaChaveApiService'
import { revokeEmpresaChaveApiService } from '../services/chave-api/revokeEmpresaChaveApiService'

export const chaveApiRouter = Router()

chaveApiRouter.post('/', async (req, res) => {
  const result = await createEmpresaChaveApiService(req.user, req.body)
  res.status(201).json(result)
})

chaveApiRouter.get('/', async (req, res) => {
  const result = await listEmpresaChaveApiService(req.user)
  res.status(200).json(result)
})

chaveApiRouter.post('/:id/revogar', async (req, res) => {
  await revokeEmpresaChaveApiService(req.user, req.params.id)
  res.status(204).send()
})
