import 'dotenv/config';
import express from 'express';
import cors from "cors";
import { errorHandlerMiddleware } from './middleware/errorHandlerMiddleware';
import { analiseLigacaoRouter } from './routers/analiseLigacao';
import { apiKeyMiddleware } from './middleware/apiKeyMiddleware'

const app = express();
const port = 3001;

// Configuração básica de CORS (ajuste origin conforme necessário)
app.use(cors({
  origin: true, // ou especifique a origem: 'http://localhost:5173'
  credentials: true
}))

app.use(express.json());

app.use('/api/analise-ligacao', analiseLigacaoRouter)

app.get("/health", (req, res) => {
  res.json({ health: true });
});

// Registrar rotas
app.use('/api', analiseLigacaoRouter);

app.use(errorHandlerMiddleware);
app.use(apiKeyMiddleware);

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});

