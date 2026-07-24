import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/useAuth'

export const useRoleBasedNavigation = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const navigateBasedOnRole = () => {
    if (user?.id) {
      navigate(user.role === 'ADMIN' ? '/videos' : '/home', { replace: true })
    } else {
      navigate('/login', { replace: true })
    }
  }

  return { navigateBasedOnRole }
}
