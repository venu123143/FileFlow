import type { IUser } from "@/types/user.types"

export function SettingsHeader({ user }: { user: IUser | null }) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-foreground mb-2">Hi, {user?.display_name}</h1>
      <p className="text-muted-foreground">Manage your details and personal preferences here.</p>
    </div>
  )
} 
