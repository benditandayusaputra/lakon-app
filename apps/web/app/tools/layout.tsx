import { RoleGuard } from '@/components/role-guard'

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard>{children}</RoleGuard>
}
