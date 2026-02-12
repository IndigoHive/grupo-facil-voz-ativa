import { useEmpresaDisponiveis } from '../../hooks/fetch/use-empresa-disponiveis'
import { useSelectEmpresa } from '../../hooks/fetch/use-select-empresa'
import { cn } from '../../lib/utils'
import { EmpresaCard } from './components/empresa-card'
import { useAuthentication } from '../../hooks/use-authentication'
import { useNavigate } from 'react-router'

export function SelecionarEmpresaPage () {
  const {
    data: empresasDisponiveis,
    isLoading,
    isError
  } = useEmpresaDisponiveis()

  const {
    mutateAsync: selectEmpresa,
    isPending: isSelectingEmpresa
  } = useSelectEmpresa()

  const authentication = useAuthentication()
  const navigate = useNavigate()

  const handleSelectEmpresa = async (empresaId: string) => {
    const result = await selectEmpresa({ empresaId })

    // Atualiza o contexto de autenticação com os novos dados
    authentication.onAuthenticatedUsuarioChange?.(result)

    // Navega para a página da empresa (substituindo histórico)
    if (result.empresa) {
      navigate(`/${result.empresa.slug}`, { replace: true })
    }
  }

  if (isLoading) {
    return (
      <div className='h-screen w-full flex items-center justify-center'>
        <p className="text-muted-foreground">Carregando empresas...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className='h-screen w-full flex items-center justify-center'>
        <p className="text-destructive">Erro ao carregar empresas</p>
      </div>
    )
  }

  return (
    <div className='h-screen w-full flex items-center justify-center p-6'>
      <div className={cn("flex flex-col gap-6 w-full max-w-2xl")}>
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Selecione uma Empresa</h1>
          <p className="text-muted-foreground">
            Escolha a empresa que você deseja acessar
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {empresasDisponiveis?.map((empresa) => (
            <EmpresaCard
              key={empresa.id}
              empresa={empresa}
              onSelect={() => handleSelectEmpresa(empresa.id)}
              isSelecting={isSelectingEmpresa}
            />
          ))}
        </div>

        {empresasDisponiveis && empresasDisponiveis.length === 0 && (
          <p className="text-center text-muted-foreground">
            Nenhuma empresa disponível
          </p>
        )}
      </div>
    </div>
  )
}
