export function KoreaMap({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 280" className={className} fill="none">
      {/* Simplified Korea outline */}
      <path
        d="M100 10 C85 15, 70 30, 65 50 C60 65, 55 80, 50 95 C45 110, 40 120, 38 135 C36 145, 35 155, 38 165 C40 175, 45 185, 50 195 C55 205, 60 215, 70 225 C80 235, 90 240, 100 245 C110 240, 120 235, 130 225 C140 215, 145 205, 150 195 C155 185, 160 175, 162 165 C165 155, 164 145, 162 135 C160 120, 155 110, 150 95 C145 80, 140 65, 135 50 C130 30, 115 15, 100 10Z"
        fill="rgba(240, 192, 112, 0.08)"
        stroke="rgba(240, 192, 112, 0.2)"
        strokeWidth="1"
      />
      {/* Travel trajectory lines */}
      <path
        d="M95 65 L85 110 L100 140 L120 170 L90 200"
        stroke="url(#routeGradient)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#glow)"
      />
      {/* City dots */}
      <circle cx="100" cy="55" r="3" fill="#F0C070" opacity="0.6" />
      <circle cx="95" cy="65" r="4" fill="#F0C070">
        <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="85" cy="110" r="4" fill="#E8A830">
        <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" begin="0.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="100" cy="140" r="3.5" fill="#F0C070">
        <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" begin="1s" repeatCount="indefinite" />
      </circle>
      <circle cx="120" cy="170" r="4" fill="#E8A830">
        <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" begin="1.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="90" cy="200" r="4.5" fill="#F0C070">
        <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" begin="0.3s" repeatCount="indefinite" />
      </circle>
      {/* City labels */}
      <text x="100" y="48" fill="rgba(240,192,112,0.5)" style={{ fontSize: 14, fontWeight: 500 }} textAnchor="middle">서울</text>
      <text x="75" cy="110" y="106" fill="rgba(232,168,48,0.5)" style={{ fontSize: 14, fontWeight: 500 }} textAnchor="middle">전주</text>
      <text x="132" y="168" fill="rgba(232,168,48,0.5)" style={{ fontSize: 14, fontWeight: 500 }} textAnchor="middle">경주</text>
      <text x="90" y="215" fill="rgba(240,192,112,0.5)" style={{ fontSize: 14, fontWeight: 500 }} textAnchor="middle">부산</text>
      <defs>
        <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F0C070" />
          <stop offset="50%" stopColor="#E8A830" />
          <stop offset="100%" stopColor="#F0C070" />
        </linearGradient>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  );
}
