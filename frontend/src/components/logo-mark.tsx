interface LogoMarkProps {
  size?: number;
  className?: string;
}

/**
 * Four dots arranged in a rotating ring, one filled — the payout always
 * moving to the next member. Distinct from a coin, a shield, or a wallet
 * icon on purpose: Ajo isn't custody, it's rotation.
 */
export function LogoMark({ size = 32, className }: LogoMarkProps) {
  const dots = [
    { cx: 16, cy: 4 },
    { cx: 28, cy: 16 },
    { cx: 16, cy: 28 },
    { cx: 4, cy: 16 },
  ];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Ajo"
    >
      <circle cx="16" cy="16" r="13" stroke="#d8c7ab" strokeWidth="1.5" strokeDasharray="2 4" />
      {dots.map((d, i) => (
        <circle key={i} cx={d.cx} cy={d.cy} r={i === 0 ? 4.5 : 3} fill={i === 0 ? "#c2410c" : "#b45309"} opacity={i === 0 ? 1 : 0.35} />
      ))}
    </svg>
  );
}
