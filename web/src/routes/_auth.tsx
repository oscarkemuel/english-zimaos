import { createFileRoute, redirect } from '@tanstack/react-router'
import { Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth')({
  beforeLoad: ({ context, location }) => {
    const auth = (context as { auth?: { isAuthenticated?: boolean } })?.auth;

    if (!auth?.isAuthenticated) {
      throw redirect({
        to: '/profiles',
        search: {
          redirect: location.href,
        },
      });
    }
  },
  component: AuthLayout,
})

function AuthLayout() {
  return (
    <Outlet />
  )
}