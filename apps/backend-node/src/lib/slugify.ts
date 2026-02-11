export function slugify(str: string): string {
  return str
    .normalize('NFD') // separa acentos das letras
    .replace(/[\u0300-\u036f]/g, '') // remove os acentos
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // remove caracteres especiais
    .trim()
    .replace(/\s+/g, '-') // troca espaços por hífens
    .replace(/-+/g, '-'); // remove múltiplos hífens
}
