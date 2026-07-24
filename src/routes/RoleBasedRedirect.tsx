import { useEffect } from 'react'
import { useRoleBasedNavigation } from '@/hooks/useRoleBasedNavigation'

const RoleBasedRedirect = () => {
  const { navigateBasedOnRole } = useRoleBasedNavigation()

  useEffect(() => {
    navigateBasedOnRole()
  }, [navigateBasedOnRole])

  return null
}

export default RoleBasedRedirect
