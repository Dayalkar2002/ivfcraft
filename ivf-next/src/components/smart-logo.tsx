export function SmartLogo({ className = 'h-12 w-12' }: { className?: string }) {
  return (
    <div className={`relative flex shrink-0 items-center justify-center ${className}`}>
      <svg viewBox="0 0 100 100" fill="none" className="h-full w-full">
        <defs>
          <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0284c7" />
            <stop offset="35%" stopColor="#2563eb" />
            <stop offset="70%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#c026d3" />
          </linearGradient>

          <linearGradient id="sproutGradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0d9488" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>

          <linearGradient id="dnaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>

        {/* Outer Circular Ring */}
        <circle cx="50" cy="50" r="44" stroke="url(#ringGradient)" strokeWidth="6" />

        {/* Plant Sprout Leaf 1 */}
        <path
          d="M 52 38 C 50 24, 62 18, 66 18 C 66 18, 64 30, 52 38 Z"
          fill="url(#sproutGradient)"
        />

        {/* Plant Sprout Leaf 2 */}
        <path
          d="M 48 38 C 42 28, 30 26, 30 26 C 30 26, 40 34, 48 38 Z"
          fill="url(#sproutGradient)"
        />

        {/* Central Stem */}
        <path
          d="M 50 48 C 50 38, 52 30, 52 24"
          stroke="url(#sproutGradient)"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* Cell Node Circle */}
        <circle cx="50" cy="46" r="6" fill="#7c3aed" />
        <circle cx="50" cy="46" r="3" fill="#ffffff" opacity="0.6" />

        {/* DNA Strand 1 (Upper Curve) */}
        <path
          d="M 20 62 Q 35 48, 50 62 T 80 62"
          stroke="url(#dnaGradient)"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* DNA Strand 2 (Lower Curve) */}
        <path
          d="M 20 72 Q 35 84, 50 72 T 80 72"
          stroke="url(#dnaGradient)"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* DNA Rung Connectors */}
        <line x1="28" y1="58" x2="28" y2="76" stroke="#c026d3" strokeWidth="2.5" />
        <line x1="38" y1="54" x2="38" y2="80" stroke="#7c3aed" strokeWidth="2.5" />
        <line x1="50" y1="62" x2="50" y2="72" stroke="#2563eb" strokeWidth="2.5" />
        <line x1="62" y1="54" x2="62" y2="80" stroke="#7c3aed" strokeWidth="2.5" />
        <line x1="72" y1="58" x2="72" y2="76" stroke="#c026d3" strokeWidth="2.5" />
      </svg>
    </div>
  );
}
