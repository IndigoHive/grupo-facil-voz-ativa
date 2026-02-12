import { useNavigate } from 'react-router'
import { Button } from '../../components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card'
import { FieldGroup, Field, FieldLabel } from '../../components/ui/field'
import { Input } from '../../components/ui/input'
import { cn } from '../../lib/utils'
import { useAuthentication } from '../../hooks/use-authentication'
import { useLogin } from '../../hooks/fetch/use-login'
import { useFormik } from 'formik'
import * as yup from 'yup'
import { useEffect } from 'react'

const schema = yup.object({
  email: yup.string().email('E-mail inválido').required('E-mail é obrigatório'),
  senha: yup.string().required('Senha é obrigatória')
})

export function LoginPage () {
  const navigate = useNavigate()
  const authentication = useAuthentication()

  const {
    mutateAsync: login
  } = useLogin()

  const formik = useFormik({
    initialValues: {
      email: '',
      senha: ''
    },
    validationSchema: schema,
    onSubmit: async (values) => {

      const result = await login({...values})

      authentication.onAuthenticatedUsuarioChange?.(result)
    }
  })

  useEffect(
    () => {
      // Aguarda o carregamento terminar
      if (authentication.loading) {
        return
      }

      // Se usuário está autenticado, redireciona
      if (authentication.authenticatedUsuario) {
        // Se já tem empresa selecionada, vai direto para a página da empresa
        if (authentication.authenticatedUsuario.empresa) {
          navigate(`/${authentication.authenticatedUsuario.empresa.slug}`, { replace: true })
        } else {
          // Senão, vai para seleção de empresa
          navigate('/', { replace: true })
        }
      }
    },
    [authentication.loading, authentication.authenticatedUsuario, navigate]
  )

  // Mostra loading enquanto verifica autenticação
  if (authentication.loading) {
    return (
      <div className='h-screen w-full flex items-center justify-center'>
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    )
  }

  // Se já está autenticado, mostra loading enquanto redireciona
  if (authentication.authenticatedUsuario) {
    return (
      <div className='h-screen w-full flex items-center justify-center'>
        <p className="text-muted-foreground">Redirecionando...</p>
      </div>
    )
  }

  return (
    <div className='h-screen w-full flex items-center justify-center'>
      <div className={cn("flex flex-col gap-6 w-full max-w-sm")}>
        <Card>
          <CardHeader>
            <CardTitle>Voz Ativa</CardTitle>
            <CardDescription>
              Acesse sua conta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={formik.handleSubmit}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    {...formik.getFieldProps('email')}
                  />
                    {formik.touched.email && formik.errors.email && (
                      <div className="text-red-500 text-sm mt-1">{formik.errors.email}</div>
                    )}
                </Field>
                <Field>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Input
                    id="password"
                    type="password"
                    {...formik.getFieldProps('senha')}
                  />
                    {formik.touched.senha && formik.errors.senha && (
                      <div className="text-red-500 text-sm mt-1">{formik.errors.senha}</div>
                    )}
                </Field>
                <Field>
                  <Button type="submit">Login</Button>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
