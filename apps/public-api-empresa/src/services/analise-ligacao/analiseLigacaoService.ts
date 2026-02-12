import { prisma } from '@voz-ativa/database';
import * as yup from 'yup';
import { validateOrThrow } from '../../lib/validateOrThrow';
import { BadRequestError } from '../../lib/errors';

const schema = yup.object({
  base64: yup.string().required(),
  unique_id: yup.string().required()
});

type AudioPayload = yup.InferType<typeof schema>;


export async function analiseLigacaoService(
  payload: AudioPayload,
  empresaId: string,
  headers: Record<string, string>
) {
  const { base64, unique_id } = validateOrThrow<AudioPayload>(schema, payload);

  // Verifica se já existe uma ligação com este unique_id para esta empresa
  const ligacaoExistente = await prisma.ligacao.findFirst({
    where: {
      id_unico: unique_id,
      empresa_id: empresaId,
    },
  });

  if (ligacaoExistente) {
    throw new BadRequestError(`Unique ID already exists for this company`);
  }

  // Prepara headers para encaminhar ao webhook
  // Remove headers hop-by-hop ou problemáticos (igual ao FastAPI)
  const forwardHeaders: Record<string, string> = { ...headers };
  delete forwardHeaders['host'];
  delete forwardHeaders['content-length'];
  delete forwardHeaders['content-type']; // Deixa o fetch definir para JSON
  delete forwardHeaders['connection'];
  delete forwardHeaders['keep-alive'];
  delete forwardHeaders['transfer-encoding'];
  delete forwardHeaders['upgrade'];

  // URL do webhook externo
  const webhookUrl = 'https://webhulk.nagaragem.com/webhook/audgpfc';

  try {
    // Encaminha o payload para o webhook externo
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...forwardHeaders,
      },
      body: JSON.stringify({
        base64,
        unique_id,
      }),
    });

    // Verifica se a resposta foi bem-sucedida
    if (!response.ok) {
      throw new BadRequestError(
        `Error response ${response.status} while requesting ${webhookUrl}`
      );
    }

    // Retorna a resposta do webhook
    const result = await response.json();
    return result;

  } catch (error) {
    if (error instanceof Error) {
      throw new BadRequestError(
        `An error occurred while requesting ${webhookUrl}: ${error.message}`
      );
    }
    throw new BadRequestError(`An error occurred while requesting ${webhookUrl}`);
  }
}

