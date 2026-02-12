import { AnySchema } from 'yup'
import { BadRequestError } from './errors'

export function validateOrThrow<T>(schema: AnySchema, data: unknown): T {
  try {
    return schema.validateSync(data, { abortEarly: false });
  } catch (err) {
    console.log(err)

    throw new BadRequestError(err instanceof Error ? err.message : 'Dados inválidos');
  }
}
