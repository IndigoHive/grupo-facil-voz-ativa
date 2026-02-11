import { useNavigate, useParams } from 'react-router'
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
  const { empresaSlug: paramEmpresaSlug } = useParams<{ empresaSlug: string }>()

  const empresaSlug = paramEmpresaSlug

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
      if (!empresaSlug) return

      const result = await login({...values, empresaSlug})

      authentication.onAuthenticatedUsuarioChange?.(result)

      localStorage.setItem('empresaSlug', empresaSlug)
    }
  })

  useEffect(
    () => {
      console.log('authentication.authenticatedUsuario', authentication.authenticatedUsuario)

      if (authentication.authenticatedUsuario) {
        navigate(`/${authentication.authenticatedUsuario.empresa_slug}`)
      }
    },
    [authentication.authenticatedUsuario, navigate]
  )

  return (
    <div className='h-screen w-full flex items-center justify-center'>
      <div className={cn("flex flex-col gap-6 w-full max-w-sm")}>
        <Card>
          <CardHeader>
            <CardTitle>Voz Ativa</CardTitle>
            <CardDescription>
              {empresaSlug}
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
