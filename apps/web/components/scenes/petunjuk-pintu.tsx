import { MousePointerClick } from 'lucide-react'

export function PetunjukPintu({ aktif, teks }: { aktif: boolean; teks: string }) {
  return (
    <>
      {aktif ? (
        <span
          aria-hidden
          className="pintu-denyut pointer-events-none absolute inset-0 rounded-t-[14px] ring-4 ring-[#f2c94c]/80"
        />
      ) : null}
      <span className="bg-panggung/90 pointer-events-none absolute -bottom-10 left-1/2 flex w-max -translate-x-1/2 items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold text-[#ffce8a] shadow-lg sm:text-sm">
        {aktif ? (
          <MousePointerClick aria-hidden size={16} className="pintu-ketuk text-[#f2c94c]" />
        ) : null}
        {teks}
      </span>
    </>
  )
}
