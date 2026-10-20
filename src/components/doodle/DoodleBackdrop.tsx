/** Subtle doodle faces pattern on cream pages */
export default function DoodleBackdrop() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 opacity-[0.14]"
      aria-hidden
      style={{
        backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(`
<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'>
  <g fill='none' stroke='#4A4A4A' stroke-width='2' stroke-linecap='round'>
    <circle cx='28' cy='32' r='14'/>
    <circle cx='22' cy='30' r='1.5' fill='#4A4A4A' stroke='none'/>
    <circle cx='34' cy='30' r='1.5' fill='#4A4A4A' stroke='none'/>
    <path d='M22 38 Q28 42 34 38'/>
    <circle cx='88' cy='78' r='12'/>
    <circle cx='83' cy='76' r='1.2' fill='#4A4A4A' stroke='none'/>
    <circle cx='93' cy='76' r='1.2' fill='#4A4A4A' stroke='none'/>
    <path d='M82 84 Q88 88 94 84'/>
    <path d='M60 18 L64 26 M64 18 L60 26'/>
    <circle cx='72' cy='28' r='3'/>
  </g>
</svg>`)}")`,
        backgroundSize: '120px 120px',
      }}
    />
  )
}
