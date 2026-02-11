import 'dotenv/config';
import express from "express";
import cookieParser from "cookie-parser";
import { authMiddleware } from "./middleware/authMiddleware";
import { authRouter } from './routers/authRouter'
import { usuarioRouter } from './routers/usuariosRouter'
import { errorHandlerMiddleware } from './middleware/errorHandlerMiddleware';
import { adminRouter } from './routers/adminRouter'
import { chaveApiRouter } from './routers/chaveApi'
import { gatilhosRouter } from './routers/gatilhosRouter'
import { ligacoesRouter } from './routers/ligacoesRouter'

const app = express();
const port = 3000;

app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRouter);
app.use("/admin", authMiddleware, adminRouter);
app.use("/chave-api", authMiddleware, chaveApiRouter)
app.use("/gatilhos", authMiddleware, gatilhosRouter)
app.use("/ligacoes", authMiddleware, ligacoesRouter)
app.use("/usuarios", authMiddleware, usuarioRouter)

app.get("/health", (req, res) => {
  res.json({ health: true });
});

app.get("/protected", authMiddleware, (req, res) => {
  res.json({ message: "Você está autenticado!", user: req.user });
});

// Middleware de tratamento de erros deve ser o último
app.use(errorHandlerMiddleware);

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
