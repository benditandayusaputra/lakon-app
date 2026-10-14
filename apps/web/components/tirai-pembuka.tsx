import { Logo } from '@/components/logo'

export function TiraiPembuka() {
  return (
    <div aria-hidden className="tirai-pembuka pointer-events-none fixed inset-0 z-[60]">
      <div className="tirai-panel tirai-kiri" />
      <div className="tirai-panel tirai-kanan" />
      <div className="tirai-logo text-halaman absolute inset-0 flex items-center justify-center gap-3 text-3xl font-bold">
        <Logo className="h-10 w-10" />
        Lakon
      </div>
    </div>
  )
}
