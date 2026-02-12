import { Router } from 'express'
import { createEmpresaService } from '../services/admin/createEmpresaService'
import { superAdminMiddleware } from '../middleware/superAdminMiddleware'
import { listEmpresasService } from '../services/admin/listEmpresasService'
import { updateEmpresaService } from '../services/admin/updateEmpresaService'
import { cleanUsuarioSenhaService } from '../services/admin/cleanUsuarioSenhaService'

export const adminRouter = Router();

adminRouter.post('/empresas', superAdminMiddleware, async (req, res) => {
  const result = await createEmpresaService(req.body);
  res.status(201).json(result);
});

adminRouter.get('/empresas', superAdminMiddleware, async (req, res) => {
  const result = await listEmpresasService();
  res.status(200).json(result);
});

adminRouter.patch('/empresas/:id', superAdminMiddleware, async (req, res) => {
  const { id } = req.params as { id: string };
  const result = await updateEmpresaService(id, req.body);
  res.status(204).json(result);
});

adminRouter.post('/usuarios/:id/limpar-senha', superAdminMiddleware, async (req, res) => {
  const { id } = req.params as { id: string };
  await cleanUsuarioSenhaService(req.user!, id);
  res.status(200).json({ message: 'Senha do usuário limpa com sucesso' });
});


