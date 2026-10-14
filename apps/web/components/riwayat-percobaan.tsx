import { History } from 'lucide-react'
import { riwayatPerIsyarat, ringkas, type AttemptEntry } from '@/features/progress/riwayat'

const persen = (nilai: number | null) => (nilai === null ? '—' : `${nilai}%`)

export function RiwayatPercobaan({
  attempts,
  siap,
  namaIsyarat,
}: {
  attempts: AttemptEntry[]
  siap: boolean
  namaIsyarat: (signId: string) => string
}) {
  const semua = ringkas(attempts)
  const perIsyarat = riwayatPerIsyarat(attempts)

  return (
    <section className="border-border-halus bg-kartu shadow-kartu rounded-kartu-besar flex flex-col gap-4 border p-5 sm:p-6">
      <h2 className="font-display flex items-center gap-2.5 text-2xl font-semibold">
        <History aria-hidden size={22} className="text-aksen" />
        Riwayat peragaanmu
      </h2>
      {!siap || attempts.length === 0 ? (
        <p className="text-teks-sekunder text-sm">
          {siap ? 'Belum ada percobaan. Peragakan satu isyarat di depan kamera.' : 'Memuat…'}
        </p>
      ) : (
        <>
          <dl className="grid grid-cols-3 gap-2 text-center">
            {(
              [
                [`${semua.persenBerhasil}%`, `berhasil (${semua.berhasil} dari ${semua.total})`],
                [persen(semua.rataKemiripan), 'rata-rata kemiripan'],
                [String(perIsyarat.length), 'isyarat dicoba'],
              ] as const
            ).map(([nilai, label]) => (
              <div key={label} className="bg-terangkat rounded-kartu px-2 py-3">
                <dd className="font-display text-2xl font-semibold">{nilai}</dd>
                <dt className="text-teks-sekunder text-xs">{label}</dt>
              </div>
            ))}
          </dl>
          <ul className="flex flex-col gap-3">
            {perIsyarat.map((item) => (
              <li key={item.signId} className="border-border-halus rounded-kartu border p-3">
                <p className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-bold first-letter:uppercase">
                    {namaIsyarat(item.signId)}
                  </span>
                  <span className="text-teks-sekunder font-mono text-xs">
                    berhasil {item.persenBerhasil}% ({item.berhasil}/{item.total}) · rata-rata{' '}
                    {persen(item.rataKemiripan)}
                  </span>
                </p>
                <ol className="mt-2 flex flex-wrap gap-1.5">
                  {item.percobaan.map((percobaan) => (
                    <li
                      key={percobaan.createdAt}
                      className={`rounded-full px-2 py-0.5 font-mono text-xs ${
                        percobaan.passed ? 'bg-berhasil text-white' : 'border-border-tegas border-2'
                      }`}
                    >
                      {persen(percobaan.similarity)} {percobaan.passed ? 'lulus' : 'belum'}
                    </li>
                  ))}
                </ol>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}
