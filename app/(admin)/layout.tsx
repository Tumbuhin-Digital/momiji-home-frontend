import { AdminLayoutWrapper } from "@/components/layouts/admin-layout-wrapper"
import { AuthProvider } from "@/components/providers/auth-provider"
import { SyncProvider } from "@/components/global/sync-provider"

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <AuthProvider>
      <AdminLayoutWrapper>
        {children}
        <SyncProvider />
      </AdminLayoutWrapper>
    </AuthProvider>
  )
}
