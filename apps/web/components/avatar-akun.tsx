export function AvatarAkun({
  nama,
  avatar,
  ukuran = 40,
  className = '',
}: {
  nama: string
  avatar: string | null
  ukuran?: number
  className?: string
}) {
  const inisial = nama
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((kata) => kata[0]?.toUpperCase() ?? '')
    .join('')
  return avatar ? (
    <img
      src={avatar}
      alt=""
      width={ukuran}
      height={ukuran}
      className={`shrink-0 rounded-full object-cover ${className}`}
      style={{ width: ukuran, height: ukuran }}
    />
  ) : (
    <span
      aria-hidden
      className={`bg-sorot text-panggung flex shrink-0 items-center justify-center rounded-full font-bold ${className}`}
      style={{ width: ukuran, height: ukuran, fontSize: Math.max(11, Math.round(ukuran * 0.4)) }}
    >
      {inisial || '?'}
    </span>
  )
}
