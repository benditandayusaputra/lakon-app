'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CompiledSign } from '@lakon/sign-compiler'
import type { Sign } from '@lakon/sign-schema'
import { AvatarStage } from '@/components/avatar-stage'
import { UmpanJawab } from '@/components/umpan-jawab'
import { acak } from '@/features/scenario/engine'
import { ESCAPE_AFTER_FAILURES } from '@/features/scenario/learning'

const rapikan = (id: string) => id.replace(/-/g, ' ')

export function LatihanBaca({
  compiled,
  sign,
  signId,
  kandidat,
  onLulus,
  onGagal,
  onLewati,
  label = rapikan,
}: {
  compiled: CompiledSign | null
  sign?: Sign
  signId: string
  kandidat: readonly string[]
  onLulus: () => void
  onGagal: () => void
  onLewati: () => void
  label?: (id: string) => string
}) {
  const [benar, setBenar] = useState<boolean | null>(null)
  const [gagal, setGagal] = useState(0)

  useEffect(() => setGagal(0), [signId])

  const pilihan = useMemo(() => {
    const lain = kandidat.filter((id) => id !== signId)
    const benih = [...signId].reduce((jumlah, huruf) => jumlah + huruf.charCodeAt(0), 7)
    return acak([signId, ...acak(lain, benih).slice(0, 3)], benih + 3)
  }, [kandidat, signId])

  const pilih = (id: string) => {
    if (id !== signId) {
      onGagal()
      setGagal((jumlah) => jumlah + 1)
    }
    setBenar(id === signId)
  }

  const tutupLalu = (lanjut: () => void) => () => {
    setBenar(null)
    lanjut()
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-zona-tenang zona-tenang-gradasi rounded-kartu relative w-full overflow-hidden">
        {compiled ? (
          <AvatarStage compiled={compiled} sign={sign} showControls className="sm:h-[54vh]" />
        ) : (
          <p className="p-8 text-center">
            Peragaan isyarat ini belum tersedia. Tebak dari konteks percakapan.
          </p>
        )}
      </div>

      <p className="font-bold">Pelanggan berisyarat. Apa maknanya?</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {pilihan.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => pilih(id)}
            className="tombol-sekunder justify-start text-left capitalize"
          >
            {label(id)}
          </button>
        ))}
      </div>
      <p className="text-teks-sekunder text-sm">
        Perhatikan bentuk tangan, tempat, dan arah geraknya.
      </p>

      {benar === null ? null : (
        <UmpanJawab
          benar={benar}
          jawaban={label(signId)}
          onLanjut={tutupLalu(onLulus)}
          onCobaLagi={() => setBenar(null)}
          onLewati={gagal >= ESCAPE_AFTER_FAILURES ? tutupLalu(onLewati) : undefined}
        />
      )}
    </div>
  )
}
