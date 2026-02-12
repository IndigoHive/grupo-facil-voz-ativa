import { Router } from 'express'
import { createGatilhoService } from '../services/gatilhos/createGatilhoService'
import { updateGatilhoService } from '../services/gatilhos/updateGatilhoService'
import { deleteGatilhoService } from '../services/gatilhos/deleteGatilhoService'
import { listGatilhosService } from '../services/gatilhos/listGatilhosService'
import { validateEmpresaAtualMiddleware } from '../middleware/validateEmpresaAtualMiddleware'

export const gatilhosRouter = Router()

gatilhosRouter.post('/', validateEmpresaAtualMiddleware, async (req, res) => {
  const result = await createGatilhoService(req.user, req.body)
  res.status(201).json(result)
})

gatilhosRouter.patch('/:id', validateEmpresaAtualMiddleware, async (req, res) => {
  const result = await updateGatilhoService(req.user, req.params.id as string, req.body)
  res.status(200).json(result)
})

gatilhosRouter.delete('/:id', validateEmpresaAtualMiddleware, async (req, res) => {
  await deleteGatilhoService(req.user, req.params.id as string)
  res.status(204).send()
})

gatilhosRouter.get('/', validateEmpresaAtualMiddleware, async (req, res) => {
  const result = await listGatilhosService(req.user)
  res.status(200).json(result)
})
