export function Logo({ className = 'h-7 w-7' }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 64 64" className={className}>
      <rect width="64" height="64" rx="14" fill="#2b6cb0" />
      <path d="M20 14v30h24v-8H30V14z" fill="#faf7f2" />
      <circle cx="44" cy="19" r="5" fill="#d9a521" />
    </svg>
  )
}
