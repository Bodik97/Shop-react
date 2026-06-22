// src/components/HeroRadar.jsx
// Декоративний "радар" у Hero: статичні кільця + обертовий промінь + пульсуючі пінги.
// Чисто декоративний (aria-hidden, pointer-events-none), поважає prefers-reduced-motion.
export default function HeroRadar({
  className = "bottom-4 right-4 w-36 sm:w-44 md:w-52 lg:bottom-auto lg:top-1/2 lg:-translate-y-1/2 lg:-right-6 lg:w-[26rem]",
}) {
  return (
    <div
      aria-hidden="true"
      className={`block pointer-events-none absolute aspect-square text-accent ${className}`}
    >
      <svg viewBox="0 0 200 200" className="w-full h-full">
        {/* Статичні кільця + перехрестя */}
        <g fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.12">
          <circle cx="100" cy="100" r="32" />
          <circle cx="100" cy="100" r="58" />
          <circle cx="100" cy="100" r="84" />
          <circle cx="100" cy="100" r="98" />
          <line x1="100" y1="2" x2="100" y2="198" />
          <line x1="2" y1="100" x2="198" y2="100" />
        </g>

        {/* Обертовий промінь (sweep) */}
        <g className="hero-radar-sweep">
          <defs>
            <linearGradient id="heroSweep" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.22" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M100 100 L100 2 A98 98 0 0 1 169 31 Z" fill="url(#heroSweep)" />
          <line x1="100" y1="100" x2="100" y2="2" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.35" />
        </g>

        {/* Пульсуючі пінги */}
        <circle cx="100" cy="100" r="14" fill="none" stroke="currentColor" strokeWidth="1.4" className="hero-radar-ping" />
        <circle cx="100" cy="100" r="14" fill="none" stroke="currentColor" strokeWidth="1.4" className="hero-radar-ping hero-radar-ping-2" />

        {/* Центр + блипи (цілі) */}
        <circle cx="100" cy="100" r="3" fill="currentColor" opacity="0.5" />
        <circle cx="146" cy="64" r="2.6" fill="currentColor" className="hero-radar-blip" />
        <circle cx="66" cy="138" r="2.2" fill="currentColor" className="hero-radar-blip hero-radar-blip-2" />
      </svg>
    </div>
  );
}
