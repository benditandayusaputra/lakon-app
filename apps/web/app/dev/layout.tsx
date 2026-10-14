import { RoleGuard } from '@/components/role-guard'

export default function DevLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard>{children}</RoleGuard>
}
