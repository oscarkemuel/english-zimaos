import useLocalStorage from '@/hooks/useLocalStorage'
import type { IUser } from '@/types/user'
import { LOCAL_STORAGE_KEYS } from '@/utils/constants'
import * as React from 'react'

export interface AuthContext {
  isAuthenticated: boolean
  user: IUser | null
  login: (newUser: IUser) => void
  logout: () => void
}

const AuthContext = React.createContext<AuthContext | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [localUser, setLocalUser, clear] = useLocalStorage(LOCAL_STORAGE_KEYS.USER, {});

  const [user, setUser] = React.useState(localUser)
  const isAuthenticated = !!user.id

  React.useEffect(() => {
    if(!user.id){
      setUser(localUser)
    }
  }, [localUser, user.id])

  const login = (newUser: IUser) => {
    if(!user.id){
      setLocalUser(newUser)
      setUser(newUser)
    }
  }

  const logout = () => {
    setLocalUser({})
    setUser({})
    clear()
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuthContext() {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}