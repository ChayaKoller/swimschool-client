// The three waves from the logo, used under the header and on the login screen
const colors = ['#B8285E', '#78A854', '#3E96BA']

function wavePath(y: number): string {
  let d = `M0 ${y}`
  for (let x = 0; x < 1200; x += 60) d += ` Q ${x + 15} ${y - 5} ${x + 30} ${y} T ${x + 60} ${y}`
  return d
}

export default function Waves({ className = '' }: { className?: string }) {
  return (
    <svg className={`block h-[22px] w-full ${className}`} viewBox="0 0 1200 22" preserveAspectRatio="none" aria-hidden="true">
      {colors.map((color, i) => (
        <path key={color} d={wavePath(6 + i * 6)} fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
      ))}
    </svg>
  )
}
