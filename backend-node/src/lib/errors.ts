export class BadRequestError extends Error {
  status: number = 400;
  constructor(message: string) {
    super(message);
    this.name = 'BadRequestError';
  }
}

export class NotFoundError extends Error {
  status: number = 404;
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

// Você pode adicionar outros erros customizados conforme necessário
