interface ReadinessRingProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function ReadinessRing({ score, size = 'sm', showLabel = true }: ReadinessRingProps) {
  const safeScore = Math.max(0, Math.min(100, Math.round(score)));

  let color = 'var(--status-bad-solid)';
  let tier = 'Critical Deficit';
  if (safeScore >= 90) {
    color = 'var(--status-ok-solid)';
    tier = 'Fully Compliant';
  } else if (safeScore >= 70) {
    color = 'var(--accent)';
    tier = 'Near Ready';
  } else if (safeScore >= 40) {
    color = 'var(--status-warn-solid)';
    tier = 'Needs Attention';
  }

  const dim = size === 'sm' ? 26 : size === 'md' ? 38 : 52;
  const strokeWidth = size === 'sm' ? 3 : size === 'md' ? 4 : 5;
  const radius = (dim - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (safeScore / 100) * circumference;
  const fontSize = size === 'sm' ? 9 : size === 'md' ? 12 : 16;

  return (
    <div
      title={`Readiness: ${safeScore}% (${tier})`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
      }}
    >
      <div style={{ position: 'relative', width: dim, height: dim }}>
        <svg width={dim} height={dim} style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            fill="transparent"
            stroke="var(--border)"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.4s ease' }}
          />
        </svg>
        <span
          className="tabular-nums"
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize,
            fontWeight: 700,
            color: 'var(--text-primary)',
          }}
        >
          {safeScore}
        </span>
      </div>
      {showLabel && size !== 'sm' && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
            {safeScore}%
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{tier}</span>
        </div>
      )}
    </div>
  );
}
